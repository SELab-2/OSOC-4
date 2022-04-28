import inspect
import re

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from fastapi.routing import APIRoute
from fastapi_jwt_auth.exceptions import AuthJWTException

from app.config import config
from app.database import disconnect_db, init_db, websocketManager
from app.exceptions.base_exception import BaseException
from app.routers import (auth, ddd, editions, emailtemplates, participations,
                         projects, reset_password, skills, students,
                         suggestions, tally, user_invites, users)

app = FastAPI(root_path=config.api_path)

origins = [
    "*",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await init_db()


@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

app.include_router(ddd.router)
# app.include_router(answers.router)
app.include_router(emailtemplates.router)
app.include_router(auth.router)
app.include_router(editions.router)
app.include_router(projects.router)
# app.include_router(question_answers.router)
# app.include_router(questions.router)
app.include_router(skills.router)
app.include_router(students.router)
app.include_router(suggestions.router)
app.include_router(participations.router)
app.include_router(tally.router)
# app.include_router(user_invites.router)
app.include_router(user_invites.router)
app.include_router(reset_password.router)
app.include_router(users.router)


@app.exception_handler(BaseException)
async def my_exception_handler(request: Request, exception: BaseException):
    return exception.json()


@app.exception_handler(AuthJWTException)
async def auth_exception_handler(request: Request, exception: AuthJWTException):
    return JSONResponse(status_code=exception.status_code, content={"message": exception.message})


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocketManager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect as e:
        websocketManager.disconnect(websocket)
        print(e)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="My Auth API",
        version="1.0",
        description="An API with an Authorize Button",
        routes=app.routes,
        servers=[{"url": config.api_path}]
    )

    openapi_schema["components"]["securitySchemes"] = {
        "Bearer Auth": {
            "type": "apiKey",
            "in": "header",
            "name": "Authorization",
            "description": "Enter: **'Bearer &lt;JWT&gt;'**, where JWT is the access token"
        }
    }

    # Get all routes where jwt_optional() or jwt_required
    api_router = [route for route in app.routes if isinstance(route, APIRoute)]

    for route in api_router:
        path = getattr(route, "path")
        endpoint = getattr(route, "endpoint")
        methods = [method.lower() for method in getattr(route, "methods")]

        for method in methods:
            # access_token
            if (
                re.search("RoleChecker", inspect.getsource(endpoint))
                or re.search("jwt_required", inspect.getsource(endpoint))
                or re.search("fresh_jwt_required", inspect.getsource(endpoint))
                or re.search("jwt_optional", inspect.getsource(endpoint))
            ):
                openapi_schema["paths"][path][method]["security"] = [
                    {
                        "Bearer Auth": []
                    }
                ]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
