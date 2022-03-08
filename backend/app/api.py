
from app.routers import answers, auth, coaches, editions, participation, partners, projects, question_answers, questions, roles, student_forms, suggestions, tally, user_invites, users
import inspect
import re

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.routing import APIRoute

from app.database import connect_db, disconnect_db

app = FastAPI()


@app.on_event("startup")
async def startup():
    connect_db()


@app.on_event("shutdown")
async def shutdown():
    disconnect_db()


app.include_router(answers.router)
app.include_router(auth.router)
app.include_router(coaches.router)
app.include_router(editions.router)
app.include_router(participation.router)
app.include_router(partners.router)
app.include_router(projects.router)
app.include_router(question_answers.router)
app.include_router(questions.router)
app.include_router(roles.router)
app.include_router(student_forms.router)
app.include_router(suggestions.router)
app.include_router(tally.router)
app.include_router(user_invites.router)
app.include_router(users.router)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="Custom title",
        version="2.5.0",
        description="This is a very custom OpenAPI schema",
        routes=app.routes,
    )
    openapi_schema["info"]["x-logo"] = {
        "url": "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png"
    }

    cookie_security_schemes = {
        "AuthJWTCookieAccess": {
            "type": "apiKey",
            "in": "header",
            "name": "X-CSRF-TOKEN"
        },
        "AuthJWTCookieRefresh": {
            "type": "apiKey",
            "in": "header",
            "name": "X-CSRF-TOKEN"
        }
    }
    refresh_token_cookie = {
        "name": "refresh_token_cookie",
        "in": "cookie",
        "required": False,
        "schema": {
            "title": "refresh_token_cookie",
            "type": "string"
        }
    }
    access_token_cookie = {
        "name": "access_token_cookie",
        "in": "cookie",
        "required": False,
        "schema": {
            "title": "access_token_cookie",
            "type": "string"
        }
    }

    if "components" in openapi_schema:
        openapi_schema["components"].update(
            {"securitySchemes": cookie_security_schemes})
    else:
        openapi_schema["components"] = {
            "securitySchemes": cookie_security_schemes}

    api_router = [route for route in app.routes if isinstance(route, APIRoute)]

    for route in api_router:
        path = getattr(route, "path")
        endpoint = getattr(route, "endpoint")
        methods = [method.lower() for method in getattr(route, "methods")]

        for method in methods:
            # access_token
            if (
                re.search("jwt_required", inspect.getsource(endpoint)) or
                re.search("fresh_jwt_required", inspect.getsource(endpoint)) or
                re.search("jwt_optional", inspect.getsource(endpoint))
            ):
                try:
                    openapi_schema["paths"][path][method]['parameters'].append(
                        access_token_cookie)
                except Exception:
                    openapi_schema["paths"][path][method].update(
                        {"parameters": [access_token_cookie]})

                # method GET doesn't need to pass X-CSRF-TOKEN
                if method != "get":
                    openapi_schema["paths"][path][method].update({
                        'security': [{"AuthJWTCookieAccess": []}]
                    })

            # refresh_token
            if re.search("jwt_refresh_token_required", inspect.getsource(endpoint)):
                try:
                    openapi_schema["paths"][path][method]['parameters'].append(
                        refresh_token_cookie)
                except Exception:
                    openapi_schema["paths"][path][method].update(
                        {"parameters": [refresh_token_cookie]})

                # method GET doesn't need to pass X-CSRF-TOKEN
                if method != "get":
                    openapi_schema["paths"][path][method].update({
                        'security': [{"AuthJWTCookieRefresh": []}]
                    })

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
