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
            modelBuilder.Entity<Board>()
                .HasMany(b => b.Notes)
                .WithOne(n => n.Board)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);

            //modelBuilder.Entity<Board>()
            //   .HasMany(e => e.Users)
            //   .WithOne(e => e.Board)
            //   .OnDelete(DeleteBehavior.ClientCascade);
        }

        public MeetingNotesContext(DbContextOptions<MeetingNotesContext> options) : base(options)
        {

        }
    }
}
