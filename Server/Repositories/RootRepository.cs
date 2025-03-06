using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TreeViewApp.Data;
using TreeViewApp.Models;

namespace TreeViewApp.Repositories
{
 public class RootRepository : IRepository<Root>
    {
        private readonly ApplicationDbContext _context;
        
        public RootRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<IEnumerable<Root>> GetAllAsync()
        {
            return await _context.Roots
                .Include(r => r.Messages)
                .ToListAsync();
        }
        
        public async Task<Root> GetByIdAsync(Guid id)
        {
            return await _context.Roots
                .Include(r => r.Messages)
                .FirstOrDefaultAsync(r => r.Id == id);
        }
        
        public async Task<IEnumerable<Root>> GetByProjectIdAsync(Guid projectId)
        {
            return await _context.Roots
                .Include(r => r.Messages)
                .Where(r => r.ProjectId == projectId)
                .ToListAsync();
        }
        
        public async Task<Root> AddAsync(Root root)
        {
            root.Id = Guid.NewGuid();
            root.CreatedDate = DateTime.Now;
            root.LastModifiedDate = DateTime.Now;
            
            _context.Roots.Add(root);
            await _context.SaveChangesAsync();
            
            return root;
        }
        
        public async Task UpdateAsync(Root root)
        {
            var existingRoot = await _context.Roots.FindAsync(root.Id);
            
            if (existingRoot != null)
            {
                existingRoot.Name = root.Name;
                existingRoot.Description = root.Description;
                existingRoot.LastModifiedDate = DateTime.Now;
                
                await _context.SaveChangesAsync();
            }
        }
        
        public async Task DeleteAsync(Guid id)
        {
            var root = await _context.Roots.FindAsync(id);
            
            if (root != null)
            {
                _context.Roots.Remove(root);
                await _context.SaveChangesAsync();
            }
        }
        
        public async Task<IEnumerable<Root>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllAsync();
                
            return await _context.Roots
                .Where(r => r.Name.Contains(searchTerm) || 
                           r.Description.Contains(searchTerm))
                .ToListAsync();
        }
    }
}