using Azure.Core;
using Microsoft.EntityFrameworkCore.Internal;
using StudentBusinessLayer.DTOs;
using StudentBusinessLayer.Interfaces;
using StudentBusinessLayer.Model;
using StudentDataAccessLayer.Interfaces;
using StudentDataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Security.AccessControl;
using System.Text;
using System.Threading.Tasks;

namespace StudentBusinessLayer.Services
{
    public class UserManagementService : IUserManagementService
    {
        private readonly IAuthService _authService;
        private readonly ITeacherService _teacherService;
        private readonly IUnitOfWork _unitOfWork;
        public UserManagementService(IAuthService authService, ITeacherService teacherService,IUnitOfWork unitOfWork)
        {
            _authService = authService;
            _teacherService = teacherService;
            _unitOfWork = unitOfWork;
        }

        public async Task<UserWithRoleDTO> RegisterTeacherAsync(RegisterTeacherDTO dto)
        {
            var RegisterModel = new RegisterModel 
            { 
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Username = dto.Username,
            Email = dto.Email,
            Password = dto.Password,

            };

           await  _unitOfWork.BeginTransactionAsync();
            try
            {
                var authResult = await _authService.RegisterAsync(RegisterModel);

                if (!authResult.IsAuthenticated || string.IsNullOrEmpty(authResult.UserId))
                    throw new InvalidOperationException($"User registration failed: {authResult.Meassage}");
 
                var teacher = new Teacher
                {
                    UserId = authResult.UserId ,
                    Name = dto.TeacherName,
                    SubjectId = dto.SubjectId,
                    
                };

                await _teacherService.AddNewTeacher (teacher);
                await _unitOfWork.Complete();

                await _unitOfWork.CommitTransactionAsync();

                return new UserWithRoleDTO
                {
                    UserId = authResult.UserId,
                    ExpirationOn = authResult.ExpirationOn,
                    TeacherId = teacher.Id,
                    Token = authResult.Token
                   
                };
            }
            catch (Exception ex)
            {
             await _unitOfWork.RollbackTransactionAsync();
                
                // Re-throw with more context
                if (ex is InvalidOperationException)
                {
                    // Let business logic errors bubble up as-is for proper error handling
                    throw;
                }
                else
                {
                    // Wrap unexpected errors
                    throw new Exception("Registration failed due to an unexpected error. Please try again.", ex);
                }
            }


        }

        public async Task<UserWithRoleDTO> RegisterAdminAsync(RegisterAdminDTO dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "Admin registration data cannot be null.");

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var model = new RegisterModel
                {
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Username = dto.Username,
                    Email = dto.Email,
                    Password = dto.Password
                };

                var result = await _authService.RegisterAdminAsync(model);

                if (!result.IsAuthenticated || string.IsNullOrEmpty(result.UserId))
                    throw new InvalidOperationException($"Admin registration failed: {result.Meassage}");

                await _unitOfWork.Complete();
                await _unitOfWork.CommitTransactionAsync();
                return new UserWithRoleDTO
                {
                    UserId = result.UserId,
                    ExpirationOn = result.ExpirationOn,
                    Token = result.Token,
                    TeacherId = null
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception("Admin registration failed", ex);
            }
        }

        public async Task DeleteTeacherAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Teacher ID must be greater than 0.", nameof(id));

            Teacher teacher = await _unitOfWork.Teachers.GetByIDAsync(id);
            if (teacher == null)
                throw new KeyNotFoundException($"Teacher with ID {id} not found.");

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                await _teacherService.DeleteTeacher(id);
                bool deleteUser = await _authService.DeleteUserByIdAsync(teacher.UserId);

                if (!deleteUser)
                    throw new Exception("Failed to delete linked user account.");

                await _unitOfWork.Complete();
                await _unitOfWork.CommitTransactionAsync();
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception("Failed to delete teacher", ex);
            }
        }
    }
}
