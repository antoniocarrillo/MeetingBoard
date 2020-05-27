using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace MeetingBoard.Hubs
{
    public class BoardHub : Hub
    {
        public async Task JoinBoard(string boardId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, boardId);

            await Clients.Group(boardId).SendAsync("Send", $"{Context.ConnectionId} has joined the board {boardId}.");
        }

        public async Task LeaveGroup(string boardId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, boardId);

            await Clients.Group(boardId).SendAsync("Send", $"{Context.ConnectionId} has left the group {boardId}.");
        }

        public async Task CreateNote(string boardId, int id, int left, int top, int width, int height)
        {
            await Clients.Group(boardId).SendAsync("CreateNote", id, left, top, width, height);
        }

        public async Task ResizeNote(string boardId, int id, int width, int height)
        {
            await Clients.Group(boardId).SendAsync("ResizeNote", id, width, height);
        }

        public async Task MoveNote(string boardId, int id, int left, int top)
        {
            await Clients.Group(boardId).SendAsync("MoveNote", id, left, top);
        }

        public async Task EditTextNote(string boardId, string connectionId, int id, string text)
        {
            await Clients.Group(boardId).SendAsync("EditTextNote", id, connectionId, text);
        }

        public async Task DeleteNote(string boardId, int id)
        {
            await Clients.Group(boardId).SendAsync("DeleteNote", id);
        }

        public async Task BringToFront(string boardId, int id)
        {
            await Clients.Group(boardId).SendAsync("BringToFront", id);
        }
    }
}
