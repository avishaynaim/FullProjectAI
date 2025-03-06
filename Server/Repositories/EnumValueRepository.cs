using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TreeViewApp.Data;
using TreeViewApp.Models;

namespace TreeViewApp.Repositories
{
   public class EnumValueRepository : IRepository<EnumValue>
    {
        private readonly ApplicationDbContext _context;
        
        public EnumValueRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<IEnumerable<EnumValue>> GetAllAsync()
        {
            return await _context.EnumValues.ToListAsync();
        }
        
        public async Task<EnumValue> GetByIdAsync(Guid id)
        {
            return await _context.EnumValues.FindAsync(id);
        }
        
        public async Task<IEnumerable<EnumValue>> GetByFieldIdAsync(Guid fieldId)
        {
            return await _context.EnumValues
                .Where(e => e.FieldId == fieldId)
                .ToListAsync();
        }
        
        public async Task<EnumValue> AddAsync(EnumValue enumValue)
        {
            enumValue.Id = Guid.NewGuid();
            
            _context.EnumValues.Add(enumValue);
            await _context.SaveChangesAsync();
            
            return enumValue;
        }
        
        public async Task UpdateAsync(EnumValue enumValue)
        {
            var existingEnumValue = await _context.EnumValues.FindAsync(enumValue.Id);
            
            if (existingEnumValue != null)
            {
                existingEnumValue.Name = enumValue.Name;
                existingEnumValue.Value = enumValue.Value;
                existingEnumValue.Description = enumValue.Description;
                
                await _context.SaveChangesAsync();
            }
        }
        
        public async Task DeleteAsync(Guid id)
        {
            var enumValue = await _context.EnumValues.FindAsync(id);
            
            if (enumValue != null)
            {
                _context.EnumValues.Remove(enumValue);
                await _context.SaveChangesAsync();
            }
        }
        
        public async Task<IEnumerable<EnumValue>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllAsync();
                
            return await _context.EnumValues
                .Where(e => e.Name.Contains(searchTerm) || 
                           e.Value.Contains(searchTerm) ||
                           e.Description.Contains(searchTerm))
                .ToListAsync();
        }
    }
}