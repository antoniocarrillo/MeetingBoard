using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using MeetingNotes.Models.Models;
using MeetingNotes.Repository;
using System.Text;
using MeetingBoard.Models;

namespace MeetingBoard.Controllers
{
    public class NotesController : Controller
    {
        private readonly MeetingNotesContext _context;

        public NotesController(MeetingNotesContext context)
        {
            _context = context;
        }

        // GET: Notes
        public async Task<IActionResult> Index()
        {
            return View(await _context.Notes.ToListAsync());
        }

        // GET: Notes/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var note = await _context.Notes
                .FirstOrDefaultAsync(m => m.Id == id);
            if (note == null)
            {
                return NotFound();
            }

            return View(note);
        }

        // GET: Notes/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Notes/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        //[ValidateAntiForgeryToken]
        public async Task<int> Create(NoteViewModel note)
        {
            var board = _context.Boards.FindAsync(note.boardId).Result;

            var newNote = new Note()
            {
                x = note.x,
                y = note.y,
                width = note.width,
                height = note.height,
                Board = board,
                Text = string.Empty
            };

            if (ModelState.IsValid)
            {
                _context.Add(newNote);
                await _context.SaveChangesAsync();
                
                return newNote.Id;
            }

            return 0;
        }

        // GET: Notes/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var note = await _context.Notes.FindAsync(id);
            if (note == null)
            {
                return NotFound();
            }
            return View(note);
        }

        // POST: Notes/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        public async Task<bool> EditSize(int id, int width, int height)
        {
            try
            {
                var note = _context.Notes.Find(id);
                note.width = width;
                note.height = height;

                _context.Update(note);
                await _context.SaveChangesAsync();
                }
                catch (Exception)
                {
                    return false;
                    throw;
                }

            return true;
        }

        // POST: Notes/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        public async Task<bool> EditPosition(int id, int x, int y)
        {
            try
            {
                var note = _context.Notes.Find(id);
                note.x = x;
                note.y= y;

                _context.Update(note);
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                return false;
                throw;
            }

            return true;
        }

        // POST: Notes/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        public async Task<bool> ChangeText(int id, string text)
        {
            try
            {
                var note = _context.Notes.Find(id);
                note.Text = text;

                _context.Update(note);
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                return false;
                throw;
            }

            return true;
        }

        // GET: Notes/Delete/5
        public async Task<Boolean> Delete(int? id)
        {
            if (id == null)
            {
                return false;
            }

            var note = await _context.Notes
                .FirstOrDefaultAsync(m => m.Id == id);
            if (note == null)
            {
                return false;
            }

            return true;
        }

        // POST: Notes/Delete/5
        [HttpPost, ActionName("Delete")]
        public async Task<bool> DeleteConfirmed(int id)
        {
            var note = await _context.Notes.FindAsync(id);
            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();
            return true;
        }

        private bool NoteExists(int id)
        {
            return _context.Notes.Any(e => e.Id == id);
        }
    }
}
