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
    public class FieldsController : ControllerBase
    {
        private readonly IRepository<Field> _fieldRepository;
        private readonly FieldRepository _typedFieldRepository;
        private readonly IHubContext<TreeViewHub> _hubContext;
        
        public FieldsController(IRepository<Field> fieldRepository, FieldRepository typedFieldRepository, IHubContext<TreeViewHub> hubContext)
        {
            _fieldRepository = fieldRepository;
            _typedFieldRepository = typedFieldRepository;
            _hubContext = hubContext;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Field>>> GetFields()
        {
            return Ok(await _fieldRepository.GetAllAsync());
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Field>> GetField(Guid id)
        {
            var field = await _fieldRepository.GetByIdAsync(id);
            
            if (field == null)
            {
                return NotFound();
            }
            
            return Ok(field);
        }
        
        [HttpGet("message/{messageId}")]
        public async Task<ActionResult<IEnumerable<Field>>> GetFieldsByMessage(Guid messageId)
        {
            return Ok(await _typedFieldRepository.GetByMessageIdAsync(messageId));
        }
        
        [HttpGet("parent/{parentFieldId}")]
        public async Task<ActionResult<IEnumerable<Field>>> GetFieldsByParent(Guid parentFieldId)
        {
            return Ok(await _typedFieldRepository.GetByParentFieldIdAsync(parentFieldId));
        }
        
        [HttpPost]
        public async Task<ActionResult<Field>> CreateField(Field field)
        {
            var createdField = await _fieldRepository.AddAsync(field);
            
            await _hubContext.Clients.All.SendAsync("FieldUpdated", createdField);
            
            return CreatedAtAction(nameof(GetField), new { id = createdField.Id }, createdField);
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateField(Guid id, Field field)
        {
            if (id != field.Id)
            {
                return BadRequest();
            }
            
            await _fieldRepository.UpdateAsync(field);
            
            await _hubContext.Clients.All.SendAsync("FieldUpdated", field);
            
            return NoContent();
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteField(Guid id)
        {
            await _fieldRepository.DeleteAsync(id);
            
            await _hubContext.Clients.All.SendAsync("FieldDeleted", id);
            
            return NoContent();
        }
        
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Field>>> SearchFields([FromQuery] string term)
        {
            return Ok(await _fieldRepository.SearchAsync(term));
        }
        
        [HttpGet("{id}/export")]
        public async Task<ActionResult<string>> ExportField(Guid id)
        {
            var field = await _fieldRepository.GetByIdAsync(id);
            
            if (field == null)
            {
                return NotFound();
            }
            
            var fieldXml = GenerateFieldXml(field);
            
            return Ok(fieldXml.ToString());
        }
        
        private XElement GenerateFieldXml(Field field)
        {
            var fieldXml = new XElement("Field",
                new XAttribute("Id", field.Id),
                new XAttribute("Name", field.Name),
                new XAttribute("Type", field.Type),
                new XElement("Description", field.Description),
                new XElement("IsRequired", field.IsRequired),
                new XElement("CreatedDate", field.CreatedDate),
                new XElement("LastModifiedDate", field.LastModifiedDate)
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