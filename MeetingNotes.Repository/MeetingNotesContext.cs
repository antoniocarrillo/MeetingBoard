using MeetingNotes.Models.Models;
using Microsoft.EntityFrameworkCore;

namespace MeetingNotes.Repository
{
    public class MeetingNotesContext : DbContext
    {

        public DbSet<Board> Boards { get; set; }

        public DbSet<Note> Notes { get; set; }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            //modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
        }

        public MeetingNotesContext(DbContextOptions<MeetingNotesContext> options) : base(options)
        {

        }
    }
}
