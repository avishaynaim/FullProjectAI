using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TreeViewApp.Data;
using TreeViewApp.Models;

namespace TreeViewApp.Repositories
{
 public class MessageRepository : IRepository<Message>
    {
        private readonly ApplicationDbContext _context;
        
        public MessageRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<IEnumerable<Message>> GetAllAsync()
        {
            return await _context.Messages
                .Include(m => m.Fields)
                .ToListAsync();
        }
        
        public async Task<Message> GetByIdAsync(Guid id)
        {
            return await _context.Messages
                .Include(m => m.Fields)
                .FirstOrDefaultAsync(m => m.Id == id);
        }
        
        public async Task<IEnumerable<Message>> GetByRootIdAsync(Guid rootId)
        {
            return await _context.Messages
                .Include(m => m.Fields)
                .Where(m => m.RootId == rootId)
                .ToListAsync();
        }
        
        public async Task<Message> AddAsync(Message message)
        {
            message.Id = Guid.NewGuid();
            message.CreatedDate = DateTime.Now;
            message.LastModifiedDate = DateTime.Now;
            
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
            
            return message;
        }
        
        public async Task UpdateAsync(Message message)
        {
            var existingMessage = await _context.Messages.FindAsync(message.Id);
            
            if (existingMessage != null)
            {
                existingMessage.Name = message.Name;
                existingMessage.Description = message.Description;
                existingMessage.LastModifiedDate = DateTime.Now;
                
                await _context.SaveChangesAsync();
            }
        }
        
        public async Task DeleteAsync(Guid id)
        {
            var message = await _context.Messages.FindAsync(id);
            
            if (message != null)
            {
                _context.Messages.Remove(message);
                await _context.SaveChangesAsync();
            }
        }
        
        public async Task<IEnumerable<Message>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllAsync();
                
            return await _context.Messages
                .Where(m => m.Name.Contains(searchTerm) || 
                           m.Description.Contains(searchTerm))
                .ToListAsync();
        }
    }
}