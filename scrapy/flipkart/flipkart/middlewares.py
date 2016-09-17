# -*- coding: utf-8 -*-
import json
import re
from scrapy import log


class FilterResponseDownloaderMiddleware(object):

    def process_response(self, request, response, spider):
        if spider.name == "mtimesindexspider":
            dict_text = re.search("{.*}", response.body).group(0)
            dict_obj = json.loads(unicode(dict_text, "utf-8"))
            if dict_obj["value"]["vcodeValid"]:
                return response
            else:
                log.msg(u'连续访问次数过多，请输入验证码！', level=log.ERROR)
                return request
        else:
            return response
