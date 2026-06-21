import os
from typing import Any
from urllib.parse import unquote, urlparse


def db_config() -> dict[str, Any]:
    mysql_url = os.getenv("MYSQL_URL")
    if mysql_url:
        parsed = urlparse(mysql_url)
        return {
            "host": parsed.hostname or "localhost",
            "port": parsed.port or 3306,
            "database": parsed.path.lstrip("/") or "chompas_mabel_db",
            "user": unquote(parsed.username or "root"),
            "password": unquote(parsed.password or ""),
        }

    config = {
        "host": os.getenv("MYSQL_HOST", "localhost"),
        "port": int(os.getenv("MYSQL_PORT", "3306")),
        "database": os.getenv("MYSQL_DATABASE", "chompas_mabel_db"),
        "user": os.getenv("MYSQL_USER", "root"),
        "password": os.getenv("MYSQL_PASSWORD", "root"),
    }

    unix_socket = os.getenv("MYSQL_UNIX_SOCKET")
    instance_connection_name = os.getenv("MYSQL_INSTANCE_CONNECTION_NAME")
    if unix_socket or instance_connection_name:
        config.pop("host", None)
        config.pop("port", None)
        config["unix_socket"] = unix_socket or f"/cloudsql/{instance_connection_name}"

    return config
