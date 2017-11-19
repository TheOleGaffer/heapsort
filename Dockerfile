FROM python:3.6.2

WORKDIR /src

ADD . .

RUN pip install -r requirements.txt

ENTRYPOINT ["python"]
CMD ["main.py"]