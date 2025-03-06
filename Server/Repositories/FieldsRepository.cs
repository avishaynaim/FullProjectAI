using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TreeViewApp.Data;
using TreeViewApp.Models;

namespace TreeViewApp.Repositories
{
   public class FieldRepository : IRepository<Field>
    {
        private readonly ApplicationDbContext _context;
        
        public FieldRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<IEnumerable<Field>> GetAllAsync()
        {
            return await _context.Fields
                .Include(f => f.ChildFields)
                .Include(f => f.EnumValues)
                .ToListAsync();
        }
        
        public async Task<Field> GetByIdAsync(Guid id)
        {
            return await _context.Fields
                .Include(f => f.ChildFields)
                .Include(f => f.EnumValues)
                .FirstOrDefaultAsync(f => f.Id == id);
        }
        
        public async Task<IEnumerable<Field>> GetByMessageIdAsync(Guid messageId)
        {
            return await _context.Fields
                .Include(f => f.ChildFields)
                .Include(f => f.EnumValues)
                .Where(f => f.MessageId == messageId && f.ParentFieldId == null)
                .ToListAsync();
        }
        
        public async Task<IEnumerable<Field>> GetByParentFieldIdAsync(Guid parentFieldId)
        {
            return await _context.Fields
                .Include(f => f.ChildFields)
                .Include(f => f.EnumValues)
                .Where(f => f.ParentFieldId == parentFieldId)
                .ToListAsync();
        }
        
        public async Task<Field> AddAsync(Field field)
        {
            field.Id = Guid.NewGuid();
            field.CreatedDate = DateTime.Now;
            field.LastModifiedDate = DateTime.Now;
            
            _context.Fields.Add(field);
            await _context.SaveChangesAsync();
            
            return field;
        }
        
        public async Task UpdateAsync(Field field)
        {
            var existingField = await _context.Fields.FindAsync(field.Id);
            
            if (existingField != null)
            {
                existingField.Name = field.Name;
                existingField.Description = field.Description;
                existingField.Type = field.Type;
                existingField.DefaultValue = field.DefaultValue;
                existingField.IsRequired = field.IsRequired;
                existingField.LastModifiedDate = DateTime.Now;
                
                await _context.SaveChangesAsync();
            }
        }
        
        public async Task DeleteAsync(Guid id)
        {
            var field = await _context.Fields.FindAsync(id);
            
            if (field != null)
            {
                _context.Fields.Remove(field);
                await _context.SaveChangesAsync();
            }
        }
        
        public async Task<IEnumerable<Field>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllAsync();
                
            return await _context.Fields
                .Where(f => f.Name.Contains(searchTerm) || 
                           f.Description.Contains(searchTerm))
                .ToListAsync();
        }
    }
}