import sys
from flask import Flask
import logging
from wsgiref.simple_server import make_server
# 导入两个模块
from dialogue_track import track_bp

# 配置日志
logging.basicConfig(level=logging.INFO)

# 创建 Flask 应用
app = Flask(__name__)

# 注册蓝图
app.register_blueprint(track_bp)

if __name__ == "__main__":
    if '--debug' in sys.argv:
        app.run(host='0.0.0.0', port=8000, debug=True)
    else:
        # 使用 WSGI 服务器运行 Flask 应用
        httpd = make_server('0.0.0.0', 8000, app)
        httpd.serve_forever()