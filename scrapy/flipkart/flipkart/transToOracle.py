#coding:utf-8
import cx_Oracle,pymongo,time
import os
os.environ['NLS_LANG'] = 'SIMPLIFIED CHINESE_CHINA.UTF8'

client = pymongo.MongoClient('45.79.0.237',27017)
#client = pymongo.MongoClient('192.168.1.188',27017)
db = client['flipkart']

db_conn = cx_Oracle.connect('esky', 'esky2015', '192.168.1.188:1521/XE')
cursor=db_conn.cursor() #获取cursor

def jdConsulation():

    beginTime = time.strftime('%H:%M:%S')
    review = db['review'].find({},{'_id':0})

    index = 0
    params = []
    aa = 0

    sql = 'insert into FLIPKART_REVIEW_T (DATAPID, CONTENT, SCORE, NAME,TITLE,HELPFULCOUNT,REVIEWID,REVIEWTIME,HELPFULRATE) values (:DATAPID, :CONTENT, :SCORE, :NAME,:TITLE,:HELPFULCOUNT,:REVIEWID,:REVIEWTIME,:HELPFULRATE)'
    cursor.prepare(sql)
    mTime = time.strftime('%H:%M:%S')

    for jc in review:
        aa+=1
        print aa
        index +=1
        param = {'DATAPID':'','CONTENT':'','SCORE':0,'NAME':'','TITLE':'','HELPFULCOUNT':0,'REVIEWID':'','REVIEWTIME':'','HELPFULRATE':''}
        content = ''
        try:
            content = jc['content']
            content = content.replace('\n',' ')
        except:
            content = ''
        try:
            param['DATAPID'] = jc['dataPid']
        except:
            param['DATAPID'] = ''

        try:
            param['SCORE'] = jc['score']
        except:
            param['SCORE'] = 0

        try:
            param['NAME'] = jc['name']
        except:
            param['NAME'] =''

        try:
            param['TITLE'] = jc['title']
        except:
            param['TITLE'] =''

        try:
            param['HELPFULCOUNT'] = jc['helpfulCount']
        except:
            param['HELPFULCOUNT'] =0

        try:
            param['HELPFULRATE'] = jc['helpfulRate']
        except:
            param['HELPFULRATE'] =''

        try:
            param['REVIEWID'] = jc['reviewId']
        except:
            param['REVIEWID'] =''

        try:
            param['REVIEWTIME'] = jc['reviewTime']
        except:
            param['REVIEWTIME'] =''


        if len(content)>1333:
            content = content[:1333]
        param['CONTENT'] = content
        params.append(param)

        if index>=5000:
            cursor.executemany(None,params);
            db_conn.commit();
            params = []
            index = 0

    if index>0:
        cursor.executemany(None,params);
        db_conn.commit();

    endTime = time.strftime('%H:%M:%S')

    cursor.close()
    db_conn.close()

    print beginTime
    print mTime
    print endTime

jdConsulation()