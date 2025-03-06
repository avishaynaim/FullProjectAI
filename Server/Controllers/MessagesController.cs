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
    public class MessagesController : ControllerBase
    {
        private readonly IRepository<Message> _messageRepository;
        private readonly MessageRepository _typedMessageRepository;
        private readonly IHubContext<TreeViewHub> _hubContext;
        
        public MessagesController(IRepository<Message> messageRepository, MessageRepository typedMessageRepository, IHubContext<TreeViewHub> hubContext)
        {
            _messageRepository = messageRepository;
            _typedMessageRepository = typedMessageRepository;
            _hubContext = hubContext;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Message>>> GetMessages()
        {
            return Ok(await _messageRepository.GetAllAsync());
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Message>> GetMessage(Guid id)
        {
            var message = await _messageRepository.GetByIdAsync(id);
            
            if (message == null)
            {
                return NotFound();
            }
            
            return Ok(message);
        }
        
        [HttpGet("root/{rootId}")]
        public async Task<ActionResult<IEnumerable<Message>>> GetMessagesByRoot(Guid rootId)
        {
            return Ok(await _typedMessageRepository.GetByRootIdAsync(rootId));
        }
        
        [HttpPost]
        public async Task<ActionResult<Message>> CreateMessage(Message message)
        {
            var createdMessage = await _messageRepository.AddAsync(message);
            
            await _hubContext.Clients.All.SendAsync("MessageUpdated", createdMessage);
            
            return CreatedAtAction(nameof(GetMessage), new { id = createdMessage.Id }, createdMessage);
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMessage(Guid id, Message message)
        {
            if (id != message.Id)
            {
                return BadRequest();
            }
            
            await _messageRepository.UpdateAsync(message);
            
            await _hubContext.Clients.All.SendAsync("MessageUpdated", message);
            
            return NoContent();
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(Guid id)
        {
            await _messageRepository.DeleteAsync(id);
            
            await _hubContext.Clients.All.SendAsync("MessageDeleted", id);
            
            return NoContent();
        }
        
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Message>>> SearchMessages([FromQuery] string term)
        {
            return Ok(await _messageRepository.SearchAsync(term));
        }
        
        [HttpGet("{id}/export")]
        public async Task<ActionResult<string>> ExportMessage(Guid id)
        {
            var message = await _messageRepository.GetByIdAsync(id);
            
            if (message == null)
            {
                return NotFound();
            }
            
            var messageXml = new XElement("Message",
                new XAttribute("Id", message.Id),
                new XAttribute("Name", message.Name),
                new XElement("Description", message.Description),
                new XElement("CreatedDate", message.CreatedDate),
                new XElement("LastModifiedDate", message.LastModifiedDate)
            );
            
            var fieldsXml = new XElement("Fields");
            
            foreach (var field in message.Fields.Where(f => f.ParentFieldId == null))
            {
                var fieldXml = GenerateFieldXml(field);
                fieldsXml.Add(fieldXml);
            }
            
            messageXml.Add(fieldsXml);
            
            return Ok(messageXml.ToString());
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