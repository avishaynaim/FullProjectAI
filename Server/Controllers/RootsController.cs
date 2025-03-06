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
    public class RootsController : ControllerBase
    {
        private readonly IRepository<Root> _rootRepository;
        private readonly RootRepository _typedRootRepository;
        private readonly IHubContext<TreeViewHub> _hubContext;
        
        public RootsController(IRepository<Root> rootRepository, RootRepository typedRootRepository, IHubContext<TreeViewHub> hubContext)
        {
            _rootRepository = rootRepository;
            _typedRootRepository = typedRootRepository;
            _hubContext = hubContext;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Root>>> GetRoots()
        {
            return Ok(await _rootRepository.GetAllAsync());
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Root>> GetRoot(Guid id)
        {
            var root = await _rootRepository.GetByIdAsync(id);
            
            if (root == null)
            {
                return NotFound();
            }
            
            return Ok(root);
        }
        
        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<IEnumerable<Root>>> GetRootsByProject(Guid projectId)
        {
            return Ok(await _typedRootRepository.GetByProjectIdAsync(projectId));
        }
        
        [HttpPost]
        public async Task<ActionResult<Root>> CreateRoot(Root root)
        {
            var createdRoot = await _rootRepository.AddAsync(root);
            
            await _hubContext.Clients.All.SendAsync("RootUpdated", createdRoot);
            
            return CreatedAtAction(nameof(GetRoot), new { id = createdRoot.Id }, createdRoot);
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoot(Guid id, Root root)
        {
            if (id != root.Id)
            {
                return BadRequest();
            }
            
            await _rootRepository.UpdateAsync(root);
            
            await _hubContext.Clients.All.SendAsync("RootUpdated", root);
            
            return NoContent();
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoot(Guid id)
        {
            await _rootRepository.DeleteAsync(id);
            
            await _hubContext.Clients.All.SendAsync("RootDeleted", id);
            
            return NoContent();
        }
        
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Root>>> SearchRoots([FromQuery] string term)
        {
            return Ok(await _rootRepository.SearchAsync(term));
        }
        
        [HttpGet("{id}/export")]
        public async Task<ActionResult<string>> ExportRoot(Guid id)
        {
            var root = await _rootRepository.GetByIdAsync(id);
            
            if (root == null)
            {
                return NotFound();
            }
            
            var xml = GenerateXml(root);
            
            return Ok(xml.ToString());
        }
        
        [HttpGet("export-all/{projectId}")]
        public async Task<ActionResult<string>> ExportAllRoots(Guid projectId)
        {
            var roots = await _typedRootRepository.GetByProjectIdAsync(projectId);
            
            var rootsXml = new XElement("Roots");
            
            foreach (var root in roots)
            {
                rootsXml.Add(GenerateXml(root));
            }
            
            return Ok(rootsXml.ToString());
        }
        
        private XElement GenerateXml(Root root)
        {
            var rootXml = new XElement("Root",
                new XAttribute("Id", root.Id),
                new XAttribute("Name", root.Name),
                new XElement("Description", root.Description),
                new XElement("CreatedDate", root.CreatedDate),
                new XElement("LastModifiedDate", root.LastModifiedDate)
            );
            
            var messagesXml = new XElement("Messages");
            
            foreach (var message in root.Messages)
            {
                var messageXml = new XElement("Message",
                    new XAttribute("Id", message.Id),
                    new XAttribute("Name", message.Name),
                    new XElement("Description", message.Description)
                );
                
                var fieldsXml = GenerateFieldsXml(message.Fields);
                messageXml.Add(fieldsXml);
                
                messagesXml.Add(messageXml);
            }
            
            rootXml.Add(messagesXml);
            
            return rootXml;
        }
        
        private XElement GenerateFieldsXml(IEnumerable<Field> fields)
        {
            var fieldsXml = new XElement("Fields");
            
            foreach (var field in fields)
            {
                if (field.ParentFieldId == null)
                {
                    var fieldXml = GenerateFieldXml(field);
                    fieldsXml.Add(fieldXml);
                }
            }
            
            return fieldsXml;
        }
        
        private XElement GenerateFieldXml(Field field)
        {
            var fieldXml = new XElement("Field",
                new XAttribute("Id", field.Id),
                new XAttribute("Name", field.Name),
                new XAttribute("Type", field.Type),
                new XElement("Description", field.Description),
                new XElement("IsRequired", field.IsRequired)
            );
            
            if (!string.IsNullOrEmpty(field.DefaultValue))
            {
                fieldXml.Add(new XElement("DefaultValue", field.DefaultValue));
            }
            
            if (field.Type == FieldType.Enum && field.EnumValues.Any())
            {
                var enumValuesXml = new XElement("EnumValues");
                
                foreach (var enumValue in field.EnumValues)
                {
                    var enumValueXml = new XElement("EnumValue",
                        new XAttribute("Name", enumValue.Name),
                        new XAttribute("Value", enumValue.Value)
                    );
                    
                    if (!string.IsNullOrEmpty(enumValue.Description))
                    {
                        enumValueXml.Add(new XElement("Description", enumValue.Description));
                    }
                    
                    enumValuesXml.Add(enumValueXml);
                }
                
                fieldXml.Add(enumValuesXml);
            }
            
            if (field.Type == FieldType.Complex && field.ChildFields.Any())
            {
                var childFieldsXml = new XElement("ChildFields");
                
                foreach (var childField in field.ChildFields)
                {
                    childFieldsXml.Add(GenerateFieldXml(childField));
                }
                
                fieldXml.Add(childFieldsXml);
            }
            
            return fieldXml;
        }
    }
}