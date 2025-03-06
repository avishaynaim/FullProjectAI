using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using TreeViewApp.Models;

namespace TreeViewApp.Hubs
{
    public class TreeViewHub : Hub
    {
        public async Task JoinProject(string projectId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, projectId);
        }
        
        public async Task LeaveProject(string projectId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, projectId);
        }
        
        public async Task NotifyProjectUpdate(Project project)
        {
            await Clients.Group(project.Id.ToString()).SendAsync("ProjectUpdated", project);
        }
        
        public async Task NotifyRootUpdate(Root root)
        {
            await Clients.Group(root.ProjectId.ToString()).SendAsync("RootUpdated", root);
        }
        
        public async Task NotifyMessageUpdate(Message message, Root root)
        {
            await Clients.Group(root.ProjectId.ToString()).SendAsync("MessageUpdated", message);
        }
        
        public async Task NotifyFieldUpdate(Field field, Message message, Root root)
        {
            await Clients.Group(root.ProjectId.ToString()).SendAsync("FieldUpdated", field);
        }
        
        public async Task NotifyEnumValueUpdate(EnumValue enumValue, Field field, Message message, Root root)
        {
            await Clients.Group(root.ProjectId.ToString()).SendAsync("EnumValueUpdated", enumValue);
        }
    }
}
