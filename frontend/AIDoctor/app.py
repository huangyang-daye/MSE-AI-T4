from flask import Flask
import logging

# 导入两个模块
from init_dialogue import dialogue_bp
from init_track import track_bp

# 配置日志
logging.basicConfig(level=logging.INFO)

# 创建 Flask 应用
app = Flask(__name__)

# 注册蓝图
app.register_blueprint(dialogue_bp)
app.register_blueprint(track_bp)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)