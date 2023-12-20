﻿using Microsoft.AspNetCore.Mvc;
//
namespace Tamza.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class MemoController : ControllerBase{
        private readonly string foldername = "AudioFiles";

        [HttpPost]
        [Route("echo")]
        public async Task<IActionResult> Echo(IFormFile file)
        {
            if (file.Length > 0)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await file.CopyToAsync(memoryStream);
                    memoryStream.Position = 0; // Ensure the stream is at the beginning
                    return File(memoryStream.ToArray(), file.ContentType);
                }
            }
            else
            {
                return BadRequest("Empty file.");
            }



        }

        [HttpPost]
        // cors
      
        public async Task<IActionResult> Post(IFormFile file)
        {   

            if (file == null)
            {
                return BadRequest("No file received.");
            }

            // check if type is audio
            if (file.ContentType != "audio/mpeg")
            {
                return BadRequest("Not an audio file.");
            }

            DriveInfo drive = new DriveInfo(Directory.GetCurrentDirectory());
            if (drive.AvailableFreeSpace < file.Length)
            {
                return BadRequest("Not enough disk space.");
            }

            string directoryPath = Path.Combine(Directory.GetCurrentDirectory(), this.foldername);
        
            if (!Directory.Exists(directoryPath))
            {
                Directory.CreateDirectory(directoryPath);
            }

            if (file.Length > 0)
            {
                string id = Guid.NewGuid().ToString();
                string filePath = Path.Combine(this.foldername, $"{id}.mp3"); // Change the file extension if needed

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                return Ok(id);
            }
            else
            {
                return BadRequest("Empty file.");
            }

        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            Console.WriteLine(id);

            var filePath = Path.Combine(this.foldername, $"{id}.mp3"); // Change the file extension if needed

            if (System.IO.File.Exists(filePath))
            {
                var memory = new MemoryStream();
                using (var stream = new FileStream(filePath, FileMode.Open))
                {
                    await stream.CopyToAsync(memory);
                }
                memory.Position = 0; // Ensure the stream is at the beginning
                return File(memory.ToArray(), "audio/mpeg");
            }
            else
            {
                return NotFound();
            }



        }
    }
}