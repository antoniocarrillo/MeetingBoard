using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MeetingBoard.Models
{
    public class NoteViewModel
    {
        public int id { get; set; }

        public int x { get; set; }

        public int y { get; set; }

        public int width { get; set; }

        public int height { get; set; }

        public int boardId { get; set; }
    }
}
