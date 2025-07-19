from flask import Flask,render_template,request, jsonify
import mysql.connector
import numpy as np
from numpy import random 
import  time   
app=Flask(__name__)
def connect_to_sql():
    conn=mysql.connector.connect(host='localhost',user='root',password="chandu0099",database='testdb')
    return conn 
def start():
    num=random.choice(range(100,999),size=(182),replace=False)
    random.shuffle(num)
    prana={}
    grids=[f"grid-{i}" for i in range(1,183)]
    temp=random.choice(num, size=(1))
    random.shuffle(grids)
    for i in range(182):
        prana[grids[i]] = num[i]
    return [prana,temp]
@app.route('/restart')
def restart():
    time.sleep(2)
    return jsonify({'status':'success'})
@app.route('/')
def home():
    fun=start()
    prana=fun[0]
    temp=fun[1][0]
    conn=connect_to_sql()
    cursor=conn.cursor()
    cursor.execute("insert into check_number(number)values(%s)",(int(temp),))
    conn.commit()
    return render_template("index.html",prana=prana,temp=temp)
@app.route('/check',methods=['POST'])
def check():
    data=request.get_json()
    grid=data['number']
    conn=connect_to_sql()
    cursor=conn.cursor()
    cursor.execute("select *from check_number")
    result=cursor.fetchall()
    if result and result[0][0]==int(grid):
        status='correct'
    else:
        status='incorrect'
    cursor.execute("delete from check_number")
    conn.commit()           
    cursor.close()             
    conn.close()
    return jsonify({'status':status})
if __name__ == "__main__":
    app.run(debug=True)
