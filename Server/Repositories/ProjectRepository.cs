using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TreeViewApp.Data;
using TreeViewApp.Models;

namespace TreeViewApp.Repositories
{
    public class ProjectRepository : IRepository<Project>
    {
        private readonly ApplicationDbContext _context;

        public ProjectRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Project>> GetAllAsync()
        {
            return await _context.Projects.Include(p => p.Roots).ToListAsync();
        }

        public async Task<Project> GetByIdAsync(Guid id)
        {
            return await _context
                .Projects.Include(p => p.Roots)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Project> AddAsync(Project project)
        {
            project.Id = Guid.NewGuid();
            project.CreatedDate = DateTime.Now;
            project.LastModifiedDate = DateTime.Now;

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return project;
        }

        public async Task UpdateAsync(Project project)
        {
            var existingProject = await _context.Projects.FindAsync(project.Id);

            if (existingProject != null)
            {
                existingProject.Name = project.Name;
                existingProject.Description = project.Description;
                existingProject.LastModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteAsync(Guid id)
        {
            var project = await _context.Projects.FindAsync(id);

            if (project != null)
            {
                _context.Projects.Remove(project);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Project>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllAsync();

            return await _context
                .Projects.Where(p =>
                    p.Name.Contains(searchTerm) || p.Description.Contains(searchTerm)
                )
                .ToListAsync();
        }
    }
}
