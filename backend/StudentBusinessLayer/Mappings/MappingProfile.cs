using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using StudentBusinessLayer.DTOs;
using StudentDataAccessLayer.Models;

namespace StudentBusinessLayer.Mappings
{
    public class MappingProfile:Profile
    {
        public MappingProfile()
        {
            CreateMap<Student,StudentDTO>()
                .ForMember(dest => dest.status, opt => opt.MapFrom(src => src.Status))
                .ReverseMap()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.status));
            
            CreateMap<StudentCreateDTO, Student>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => true)) // Default to Active
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.Now))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.Now));
            
            CreateMap<StudentUpdateDTO, Student>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.status))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.Now));
            
            CreateMap<StudentUpdateDTO, StudentDTO>()
                .ForMember(dest => dest.id, opt => opt.Ignore())
                .ForMember(dest => dest.createdAt, opt => opt.Ignore());
            CreateMap<Teacher,TeacherDTO>().ReverseMap();
            CreateMap<Teacher, TeacherWithDetailsDTO>()
                .ForMember(dest => dest.email, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.TeacherAssignedClasses, opt => opt.MapFrom(src => src.TeacherClasses.Select(tc => tc.Classroom)));
            CreateMap<Classroom, ClassroomDTOWithDetails>().ForMember(dest => dest.Teachers, opt => opt.MapFrom(src => src.TeacherClasses.Select(tc => tc.Teacher)));
            CreateMap<Classroom, ClassroomDTO>().ReverseMap();
            CreateMap<Attendance, AttendanceDTO>()
                .ForMember(dest => dest.date, opt => opt.MapFrom(src => src.Date))
                .ForMember(dest => dest.studentName, opt => opt.MapFrom(src => src.Student != null ? src.Student.Name : null))
                .ForMember(dest => dest.classroomName, opt => opt.MapFrom(src => src.Classroom != null ? src.Classroom.Name : null));
            
            CreateMap<AttendanceDTO, Attendance>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.date))
                .ForMember(dest => dest.IsPresent, opt => opt.MapFrom(src => src.isPresent))
                .ForMember(dest => dest.Student, opt => opt.Ignore())
                .ForMember(dest => dest.Classroom, opt => opt.Ignore());
            CreateMap<Subject, SubjectDTO>().ReverseMap ();
            CreateMap<Grade, GradeDTO>().ReverseMap();
            CreateMap<Grade, GradeWithDetailsDTO>().ReverseMap();


        }
    }
}
