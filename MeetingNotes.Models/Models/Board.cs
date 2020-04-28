using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MeetingNotes.Models.Models
{
    public class Board
    {

        public Board()
        {
            Users = new List<User>();
            Notes = new List<Note>();
        }

        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; }

        public Uri Background { get; set; }

        public List<Note> Notes { get; set; }

        public List<User> Users { get; set; }

        [Required]
        public bool HasPassword { get; set; }

        public string Password { get; set; }
    }
}
