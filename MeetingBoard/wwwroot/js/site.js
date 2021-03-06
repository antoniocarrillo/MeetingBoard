﻿let connection;

let connectionId = "";

let isDragging = false;
let boardId = 0;
let boardIdString = "";
let siteName = "";
let zIndexCounter = 4;

const defaultWidth = 300;
const defaultHeight = 300;

$(document).ready(function () {

    initializeBoard();

    connectSignalRHub();

    $("#font-selector").change(function () {
        var newFont = $("#font-selector").val();
        $(".note").css("font-family", newFont);
    });
});

/* UI HANDLING METHODS */

let handleStartDragging = function(event, ui) {
    isDragging = true;
};

let handleStopDragging = function(event, ui) {
        event.stopPropagation();
    event.stopImmediatePropagation();
    isDragging = false;
    var id = extractId(event.target.id);
    sendMoveNoteRequest(id, ui.position.left, ui.position.top);
}

let handleStartResizing = function (event, ui) {
    isDragging = true;
    event.stopPropagation();
    event.stopImmediatePropagation();
}

let handleStopResizing = function (event, ui) {
    isDragging = false;

    var id = extractId(event.target.id);

    sendResizeNoteRequest(id,ui.size.width, ui.size.height);
    event.stopPropagation();
    event.stopImmediatePropagation();
}

/* AJAX REQUESTS METRHODS */

let sendCreateNoteRequest = function(x, y, width, height) {
    var note = {
        id: 0,
        x: x,
        y: y,
        width: width,
        height: height,
        text: " ",
        boardId: boardId
    }

    $.ajax({
        type: "POST",
        url: CreateNoteAction,
        data: { note: note },
        dataType: "json",
        success: function (id) {
            if (id == 0) {
                console.log("something went wrong");
            }
            connection.invoke("CreateNote", boardIdString, id, x, y, width, height).catch(function(err) {
                return console.error(err.toString());
            });
        },
        error: function() {
            console.log("Error while inserting data");
        }
    });
};

let sendResizeNoteRequest = function(id, width, height) {
    $.ajax({
        type: "POST",
        url: EditNoteSizeAction,
        data: { id: id, width: width, height: height},
        dataType: "json",
        success: function (res) {
            connection.invoke("ResizeNote", boardIdString, parseInt(id), width, height).catch(function (err) {
                return console.error(err.toString());
            });
        },
        error: function () {
            console.log("Error while inserting data");
        }
    });
}

let sendMoveNoteRequest = function(id, x, y) {
    $.ajax({
        type: "POST",
        url: EditNotePositionAction,
        data: { id: id, x: x, y: y },
        dataType: "json",
        success: function(res) {
            console.log("done moving note" + res);
            connection.invoke("MoveNote", boardIdString, parseInt(id), x, y).catch(function(err) {
                return console.error(err.toString());
            });
        },
        error: function() {
            console.log("Error while inserting data");
        }
    });
};

let sendChangeNoteTextRequest = function(id, text) {
    $.ajax({
        type: "POST",
        url: ChangeNoteTextAction,
        data: { id: id, text: text },
        dataType: "json",
        success: function(res) {
            console.log("done moving note" + res);
            connection.invoke("EditTextNote", boardIdString, connectionId, parseInt(id), text).catch(function(err) {
                return console.error(err.toString());
            });
        },
        error: function() {
            console.log("Error while inserting data");
        }
    });
};

let sendDeleteNoteRequest = function(id) {
    $.ajax({
        type: "POST",
        data: { id: id },
        url: DeleteNoteAction + "/" + id,
        success: function(res) {
            connection.invoke("DeleteNote", boardIdString, parseInt(id)).catch(function(err) {
                return console.error(err.toString());
            });
        },
        error: function() {
            console.log("Error while inserting data");
        }
    });
}

/* HANDLE SIGNALR EVENTS */

let handleNoteCreatedEvent = function(id, x, y, width, height, text) {
    let board = $("#board");

    var note = {
        id: "note-" + id,
        class: "note disabled",
        css: {
            "width": width,
            "height": height,
            "top": y,
            "left": x,
            "position": "absolute",
            "z-index": zIndexCounter++
        },
        "on": {
            "mousedown": function (event) {
                eventTargetId = event.target.id != "" ? event.target.id : event.target.parentElement.id;
                extractedId = extractId(eventTargetId);
                console.log(event);
                connection.invoke("BringToFront", boardIdString, parseInt(extractedId)).catch(function (err) {
                    return console.error(err.toString());
                });
                
            },
            "click": function (event) {
                console.log("click note");
                event.stopPropagation();
                event.stopImmediatePropagation();
            }
        }
    };

    var noteText = {
        class: "note-text",
        "on": {
            "click": function(event) {
                event.stopPropagation();
                event.stopImmediatePropagation();
                if (event.which != 1) {
                    return;
                }
                $(".note").addClass("disabled").removeClass("enabled");
                console.log("mousedown note text");
               $(this).parent().removeClass("disabled").addClass("enabled");
            },
            "keyup": function() {
                if ($(this).get(0).scrollHeight > $(this).height() & $(this).css('font-size') > 5) {
                    $(this).css('font-size', '-=1');
                    console.log("something happened");
                } else if ($(this).get(0).scrollHeight < $(this).height() & $(this).css('font-size') < 14) {
                    $(this).css('font-size', '+=1');
                }
                var elemId = extractId($(this)[0].parentElement.id);
                var nText = $(this).val();

                console.log(nText);

                sendChangeNoteTextRequest(elemId, nText);
            }
        }
    };

    var deleteButton = {
        class: "material-icons delete-button action-button",
        text: "delete_forever",
        "on" : {
            "mousedown": function (event) {
                event.stopPropagation();
                event.stopImmediatePropagation();
                var id = extractId(event.target.parentElement.id);
                sendDeleteNoteRequest(id);
            },
        }
    };

    var moveArea = {
        class: "move-area"
    };

    let $noteHtml = $("<div>", note);
    let $noteText = $("<textarea>", noteText);
    let $deleteButtonHtml = $("<i>", deleteButton);
    let $moveAreaHtml = $("<div>", moveArea);

    $noteText.val(text);

    $noteHtml.draggable({
        stop: function(event, ui) {
            handleStopDragging(event, ui);
        },
        start: function(event, ui) {
            handleStartDragging(event, ui);
        },
        drag: function(event, ui) {
            event.stopPropagation();
            event.stopImmediatePropagation();
        },
        create: function(event, ui) {
            //resizableHandle();
        }
    }).resizable({
        start: function(event, ui) {
            handleStartResizing(event, ui);
        },
        stop: function(event, ui) {
            handleStopResizing(event, ui);
        },
        minHeight: 150,
        minWidth: 200,
    });

    $noteText.quickfit();

    $noteHtml.append($noteText);
    $noteHtml.append($deleteButtonHtml);
    $noteHtml.append($moveAreaHtml);

    board.append($noteHtml);
};

let handleNoteMovedEvent = function(id, x, y)
{
    var noteSelector = "#note-" + id;
    var note = $(noteSelector);
    note.css('left', x + 'px');
    note.css('top', y + 'px');
};

let handleNoteResizedEvent = function(id, width, height)
{
    var noteSelector = "#note-" + id;
    var note = $(noteSelector);
    note.css('width', width + 'px');
    note.css('height', height + 'px');
};

let handleEditTextNoteEvent = function(id, messageConnectionId, text)
{
    if (messageConnectionId != connectionId) {
        var noteTextSelector = "#note-" + id + " .note-text";
        var noteText = $(noteTextSelector);
        noteText.val(text);
    }
};

let handleNoteDeletedEvent = function(id) {
    var noteSelector = "#note-" + id;
    $(noteSelector).remove();
};

let handleBringToFrontEvent = function (id) {
    var noteSelector = "#note-" + id;
    $(noteSelector).css('z-index', zIndexCounter++);
};

/* AUXILIARY METHODS */

let initializeBoard = function() {
    $("<div id='board'></div>").insertAfter("#main-container");

    $.each(notesArray,
        function(index, value) {
            handleNoteCreatedEvent(value.id, value.x, value.y, value.width, value.height, value.text);
        });

    $("#board").addClass(boardBackground + "-background");

    $("#board").click(function(e) {
        if (e.which != 1) {
            return;
        }
        sendCreateNoteRequest(e.clientX, e.clientY, defaultWidth, defaultHeight);
    });

    $("#board").mousedown(function() {
        console.log("mousedown board");

    });
    $("#board").mouseup(function(e) {
        console.log("mouseup board");
    });
};

let connectSignalRHub = function() {
     var pathArray = window.location.pathname.split('/');
    firstPathElement = pathArray[1];
    boardId = pathArray[pathArray.length-1];
    boardIdString = boardId.toString();

    siteName = firstPathElement != "Boards" ? ("/" + firstPathElement) : ""; 

    connection = new signalR.HubConnectionBuilder().withUrl(siteName + "/boardHub").build();
    var boardString = boardId.toString();
    connection.start().then(() =>
        connection.invoke("JoinBoard", boardIdString).catch(function (err) {
            return console.error(err.toString());
        })).then(() => connectionId = connection.connection.connectionId);

    connection.on("CreateNote",
        function(id, left, top, width, height) {
            handleNoteCreatedEvent(id, left, top, width, height, "");
        });

    connection.on("ResizeNote",
        function(id, width, height) {
            handleNoteResizedEvent(id, width, height);
        });

    connection.on("MoveNote",
        function(id, left, top) {
            handleNoteMovedEvent(id, left, top);
        });

    connection.on("EditTextNote",
        function(id, messageConnectionId, text) {
            handleEditTextNoteEvent(id, messageConnectionId, text);
        });

    connection.on("DeleteNote",
        function(id) {
            handleNoteDeletedEvent(id);
        });

    connection.on("BringToFront",
        function(id) {
            handleBringToFrontEvent(id);

        });
};

let extractId = function(elementId) {
    let re = new RegExp("(note\\-)(\\d+)");
    var found = elementId.match(re);
    var id = found[2];

    return id;
};