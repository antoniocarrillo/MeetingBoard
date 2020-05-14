let connection;

let isDragging = false
let isEditing = false
let finishEditing = false
let editedNote
let editedId = 0
let boardId = 0;
let siteName = ""

const defaultWidth = 300
const defaultHeight = 300

let zIndexCounter = 4


$(document).ready(function () {
    //var container = $("#main-container");
    //var boardDefinition = {
    //    id: "board"
    //};
    //var board = $("<div>", boardDefinition);
    $("<div id='board'></div>").insertAfter("#main-container");

    $.each(notesArray, function (index, value) {
        handleNoteCreatedEvent(value.id, value.x, value.y, value.width, value.height, value.text);
    });


    $("#board").addClass(boardBackground + "-background");

    $("#board").click(function (e) {
        console.log("click board");
        if (e.which != 1) {
            return;
        }
        createNote(e);
    });
    $("#board").mousedown(function () {
        console.log("mousedown board");

    });
    $("#board").mouseup(function (e) {
        console.log("mouseup board");
    });

    var pathArray = window.location.pathname.split('/');
    firstPathElement = pathArray[1];
    boardId = pathArray[3];

    siteName = firstPathElement != "Boards" ? ("/" + siteName) : ""; 

    connection = new signalR.HubConnectionBuilder().withUrl(siteName + "/boardHub").build();
    connection.start();

    connection.on("CreateNote", function (id, left, top, width, height) {
        handleNoteCreatedEvent(id, left, top, width, height, "");
    });

    connection.on("ResizeNote", function (id, width, height) {
        handleNoteResizedEvent(id, width, height);
    });

    connection.on("MoveNote", function (id, left, top) {
        handleNoteMovedEvent(id, left, top);
    });

    connection.on("EditTextNote", function (id, text) {
        handleEditTextNoteEvent(id, text);
    });

    connection.on("DeleteNote", function (id) {
        handleNoteDeletedEvent(id);
    });

    connection.on("BringToFront", function (id) {
        handleBringToFrontEvent(id);
       
    });

    $("#font-selector").change(function () {
        var newFont = $("#font-selector").val();
        $(".note").css("font-family", newFont);
    });
});


let createNote = function(e) {
    //if (isDragging)
    //    return;

    // Enters right after clicked on text area
    // Prevents creation of note, since thats not intention
    if (isEditing) {
        isEditing = false;
        finishEditing = true
        return;
    }

    // Enter right when you click outside the text and you were entering text
    // Triggers saving the text
    if (finishEditing) {
        finishEditing = false;
        var text = editedNote.val();
        sendChangeNoteTextRequest(editedId, text);
    }

    sendCreateNoteRequest(e.clientX, e.clientY, defaultWidth, defaultHeight);
};

//let resizableHandle = function ()
//{
//    $(".ui-resizable-handle").on("click",
//    function (event) {
//        event.stopPropagation();
//        event.stopImmediatePropagation();
//        console.log("note text click");
//    });
//}



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

let sendCreateNoteRequest = function(x, y, width, height) {
    var note = {
        id: 0,
        x: x,
        y: y,
        width: width,
        height: height,
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
            connection.invoke("CreateNote", id, x, y, width, height).catch(function(err) {
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
            connection.invoke("ResizeNote", parseInt(id), width, height).catch(function (err) {
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
            connection.invoke("MoveNote", parseInt(id), x, y).catch(function(err) {
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
            connection.invoke("EditTextNote", parseInt(id), text).catch(function(err) {
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
            connection.invoke("DeleteNote", parseInt(id)).catch(function(err) {
                return console.error(err.toString());
            });
        },
        error: function() {
            console.log("Error while inserting data");
        }
    });
}

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
                connection.invoke("BringToFront", parseInt(extractedId)).catch(function (err) {
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
                editedNote = $(this);
                editedId = extractId(event.target.parentElement.id);
                isEditing = true;
                $(this).parent().removeClass("disabled").addClass("enabled");
            },
            "keypress": function() {
                if ($(this).get(0).scrollHeight > $(this).height() & $(this).css('font-size') > 5) {
                    $(this).css('font-size', '-=1');
                    console.log("something happened");
                } else if ($(this).get(0).scrollHeight < $(this).height() & $(this).css('font-size') < 14) {
                    $(this).css('font-size', '+=1');
                }
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

    var editButton = {
        class: "material-icons edit-button action-button",
        text: "edit",
        "on" : {
            "mousedown": function (event) {
                event.stopPropagation();
                event.stopImmediatePropagation();
                $(this).parent().removeClass("enabled").addClass("disabled");

                var noteSelector = "#note-" + id;
                var note = $(noteSelector);
                var noteText = note.find(".note-text");

                console.log(noteText.val());

                sendChangeNoteTextRequest(editedId, noteText.val());
            }
        }
    };

    var moveArea = {
        class: "move-area"
    };

    let $noteHtml = $("<div>", note);
    let $noteText = $("<textarea>", noteText);
    let $deleteButtonHtml = $("<i>", deleteButton);
    let $editButtonHtml = $("<i>", editButton);
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
    $noteHtml.append($editButtonHtml);
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

let handleEditTextNoteEvent = function(id, text)
{
    var noteTextSelector = "#note-" + id + " .note-text";
    var noteText = $(noteTextSelector);
    noteText.val(text);
};

let handleNoteDeletedEvent = function(id) {
    var noteSelector = "#note-" + id;
    $(noteSelector).remove();
};

let handleBringToFrontEvent = function (id) {
    var noteSelector = "#note-" + id;
    $(noteSelector).css('z-index', zIndexCounter++);
};

let extractId = function(elementId) {
    let re = new RegExp("(note\\-)(\\d+)");
    var found = elementId.match(re);
    var id = found[2];

    return id;
};