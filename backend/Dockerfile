FROM python:3.9


WORKDIR /app/
ADD ./requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt
COPY . .

CMD ["uvicorn","app.api:app","--host", "0.0.0.0", "--port", "8000"]