using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace MeetingBoard.Hubs
{
    public class BoardHub : Hub
    {
        public async Task CreateNote(int id, int left, int top, int width, int height)
        {
            await Clients.All.SendAsync("CreateNote", id, left, top, width, height);
        }

        public async Task ResizeNote(int id, int width, int height)
        {
            await Clients.All.SendAsync("ResizeNote", id, width, height);
        }

        public async Task MoveNote(int id, int left, int top)
        {
            await Clients.All.SendAsync("MoveNote", id, left, top);
        }

        public async Task EditTextNote(int id, string text)
        {
            await Clients.All.SendAsync("EditTextNote", id, text);
        }

        public async Task DeleteNote(int id)
        {
            await Clients.All.SendAsync("DeleteNote", id);
        }
    }
}
