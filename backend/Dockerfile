FROM python:3.9


WORKDIR /app/
COPY . .
RUN pip install -r requirements.txt

CMD ["uvicorn","app.api:app","--host", "0.0.0.0", "--port", "8000"]