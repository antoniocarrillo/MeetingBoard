using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MeetingBoard.Encryption;

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

        public string Background { get; set; }

        public List<Note> Notes { get; set; }

        public List<User> Users { get; set; }

        [Required]
        [DisplayName("Password Protected")]
        public bool HasPassword { get; set; }
        
        public string PasswordStored { get; set; }

        [NotMapped]
        public string Password {
            get {
                if(PasswordStored !=null)
                {
                    return Encryption.DecryptString(PasswordStored);
                }
                else
                {
                    return null;
                }

}
            set { 
                if(value != null)
                    {
                        PasswordStored = Encryption.EncryptString(value);
                    }
                }
        }
    }
}
