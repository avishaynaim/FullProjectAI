using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TreeViewApp.Hubs;
using TreeViewApp.Models;
using TreeViewApp.Repositories;

namespace TreeViewApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly IRepository<Project> _projectRepository;
        private readonly IHubContext<TreeViewHub> _hubContext;
        
        public ProjectsController(IRepository<Project> projectRepository, IHubContext<TreeViewHub> hubContext)
        {
            _projectRepository = projectRepository;
            _hubContext = hubContext;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            Console.WriteLine("GetProjects");  
            return Ok(await _projectRepository.GetAllAsync());
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(Guid id)
        {
            var project = await _projectRepository.GetByIdAsync(id);
            
            if (project == null)
            {
                return NotFound();
            }
            
            return Ok(project);
        }
        
        [HttpPost]
        public async Task<ActionResult<Project>> CreateProject(Project project)
        {
            var createdProject = await _projectRepository.AddAsync(project);
            
            await _hubContext.Clients.All.SendAsync("ProjectUpdated", createdProject);
            
            return CreatedAtAction(nameof(GetProject), new { id = createdProject.Id }, createdProject);
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(Guid id, Project project)
        {
            if (id != project.Id)
            {
                return BadRequest();
            }
            
            await _projectRepository.UpdateAsync(project);
            
            await _hubContext.Clients.All.SendAsync("ProjectUpdated", project);
            
            return NoContent();
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(Guid id)
        {
            await _projectRepository.DeleteAsync(id);
            
            await _hubContext.Clients.All.SendAsync("ProjectDeleted", id);
            
            return NoContent();
        }
        
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Project>>> SearchProjects([FromQuery] string term)
        {
            return Ok(await _projectRepository.SearchAsync(term));
        }
    }
}