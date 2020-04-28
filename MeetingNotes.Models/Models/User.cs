using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MeetingNotes.Models.Models
{
    public class User
    {
        [Required]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]  
        [Key]
        public string Name { get; set; }

        public string Ip { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]  
        [Key]
        [JsonIgnore]
        public Board Board { get; set; }
    }
}
