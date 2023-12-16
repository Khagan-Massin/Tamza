using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

 
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(p => p.AddPolicy("corsapp", builder =>
    {
        builder.WithOrigins("*").AllowAnyMethod().AllowAnyHeader();
    }));

 
WebApplication app = builder.Build();

app.UseCors("corsapp");


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
    app.UseHttpLogging();
}

 
 

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
