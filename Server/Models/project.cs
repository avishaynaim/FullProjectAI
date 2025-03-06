using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.Json.Serialization;

namespace TreeViewApp.Models
{
    public class Project
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        [MaxLength(500)]
        public string Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastModifiedDate { get; set; }
        
        public virtual ICollection<Root> Roots { get; set; } = new List<Root>();
    }

    public class Root
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        [MaxLength(500)]
        public string Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastModifiedDate { get; set; }
        
        [ForeignKey("ProjectId")]
        public Guid ProjectId { get; set; }
        public virtual Project Project { get; set; }
        
        public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
    }

    public class Message
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        [MaxLength(500)]
        public string Description { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastModifiedDate { get; set; }
        
        [ForeignKey("RootId")]
        public Guid RootId { get; set; }
        public virtual Root Root { get; set; }
        
        public virtual ICollection<Field> Fields { get; set; } = new List<Field>();
    }

    public enum FieldType
    {
        String,
        Integer,
        Decimal,
        Boolean,
        DateTime,
        Enum,
        Complex
    }

    public class Field
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        [MaxLength(500)]
        public string Description { get; set; }
        public FieldType Type { get; set; }
        public string DefaultValue { get; set; }
        public bool IsRequired { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastModifiedDate { get; set; }
        
        [ForeignKey("MessageId")]
        public Guid? MessageId { get; set; }
        public virtual Message Message { get; set; }
        
        [ForeignKey("ParentFieldId")]
        public Guid? ParentFieldId { get; set; }
        public virtual Field ParentField { get; set; }
        
        public virtual ICollection<Field> ChildFields { get; set; } = new List<Field>();
        
        public virtual ICollection<EnumValue> EnumValues { get; set; } = new List<EnumValue>();
    }

    public class EnumValue
    {
        [Key]
        public Guid Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        [Required]
        [MaxLength(100)]
        public string Value { get; set; }
        [MaxLength(500)]
        public string Description { get; set; }
        
        [ForeignKey("FieldId")]
        public Guid FieldId { get; set; }
        public virtual Field Field { get; set; }
    }
}
