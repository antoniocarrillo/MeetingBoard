using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MeetingNotes.Models.Models
{
    public class Note
    {
        public int Id { get; set; }

        [Required]
        public int x { get; set; }

        [Required]
        public int y { get; set; }

        [Required]
        public int width { get; set; }

        [Required]
        public int height { get; set; }

        public string Color { get; set; }

        public string Title { get; set; }

        public string Text { get; set; }

        [JsonIgnore]
        public Board Board { get; set; }

        public User Creator { get; set; }
    }
}
