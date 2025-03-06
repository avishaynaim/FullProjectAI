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
    public class EnumValuesController : ControllerBase
    {
        private readonly IRepository<EnumValue> _enumValueRepository;
        private readonly EnumValueRepository _typedEnumValueRepository;
        private readonly IHubContext<TreeViewHub> _hubContext;
        
        public EnumValuesController(IRepository<EnumValue> enumValueRepository, EnumValueRepository typedEnumValueRepository, IHubContext<TreeViewHub> hubContext)
        {
            _enumValueRepository = enumValueRepository;
            _typedEnumValueRepository = typedEnumValueRepository;
            _hubContext = hubContext;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EnumValue>>> GetEnumValues()
        {
            return Ok(await _enumValueRepository.GetAllAsync());
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<EnumValue>> GetEnumValue(Guid id)
        {
            var enumValue = await _enumValueRepository.GetByIdAsync(id);
            
            if (enumValue == null)
            {
                return NotFound();
            }
            
            return Ok(enumValue);
        }
        
        [HttpGet("field/{fieldId}")]
        public async Task<ActionResult<IEnumerable<EnumValue>>> GetEnumValuesByField(Guid fieldId)
        {
            return Ok(await _typedEnumValueRepository.GetByFieldIdAsync(fieldId));
        }
        
        [HttpPost]
        public async Task<ActionResult<EnumValue>> CreateEnumValue(EnumValue enumValue)
        {
            var createdEnumValue = await _enumValueRepository.AddAsync(enumValue);
            
            await _hubContext.Clients.All.SendAsync("EnumValueUpdated", createdEnumValue);
            
            return CreatedAtAction(nameof(GetEnumValue), new { id = createdEnumValue.Id }, createdEnumValue);
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEnumValue(Guid id, EnumValue enumValue)
        {
            if (id != enumValue.Id)
            {
                return BadRequest();
            }
            
            await _enumValueRepository.UpdateAsync(enumValue);
            
            await _hubContext.Clients.All.SendAsync("EnumValueUpdated", enumValue);
            
            return NoContent();
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEnumValue(Guid id)
        {
            await _enumValueRepository.DeleteAsync(id);
            
            await _hubContext.Clients.All.SendAsync("EnumValueDeleted", id);
            
            return NoContent();
        }
        
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<EnumValue>>> SearchEnumValues([FromQuery] string term)
        {
            return Ok(await _enumValueRepository.SearchAsync(term));
        }
    }
}