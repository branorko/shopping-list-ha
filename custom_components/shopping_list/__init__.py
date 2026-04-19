"""Shopping List — Home Assistant custom integration."""
from __future__ import annotations

import json
import logging
from pathlib import Path

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.helpers import config_validation as cv
from homeassistant.config_entries import ConfigEntry

_LOGGER = logging.getLogger(__name__)

DOMAIN = "shopping_list"
STORAGE_KEY = "shopping_list.data"
STORAGE_VERSION = 1

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

WWW_DIR = Path(__file__).parent / "www"
CARD_FILE = "shopping-list-card.js"
STATIC_PATH = "/shopping_list_static"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Shopping List from a config entry."""
    store = Store(hass, STORAGE_VERSION, STORAGE_KEY)

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["store"] = store

    # Register REST API
    hass.http.register_view(ShoppingListDataView(store))

    # Serve www/ — try new API first, fall back to old
    try:
        from homeassistant.components.http import StaticPathConfig
        await hass.http.async_register_static_paths([
            StaticPathConfig(STATIC_PATH, str(WWW_DIR), cache_headers=False)
        ])
    except Exception:
        try:
            hass.http.register_static_path(STATIC_PATH, str(WWW_DIR), cache_headers=False)
        except Exception as e:
            _LOGGER.warning("Static path registration failed: %s", e)

    # Auto-register JS card
    try:
        from homeassistant.components.frontend import add_extra_js_url
        add_extra_js_url(hass, f"{STATIC_PATH}/{CARD_FILE}")
        _LOGGER.info("Shopping List card registered at %s/%s", STATIC_PATH, CARD_FILE)
    except Exception as e:
        _LOGGER.warning("JS auto-registration failed: %s — add resource manually.", e)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    hass.data[DOMAIN].pop("store", None)
    return True


class ShoppingListDataView(HomeAssistantView):
    """REST API: GET/POST /api/shopping_list/data"""

    url = "/api/shopping_list/data"
    name = "api:shopping_list:data"
    requires_auth = True

    def __init__(self, store: Store):
        self._store = store

    async def get(self, request: web.Request) -> web.Response:
        data = await self._store.async_load()
        if data is None:
            data = {"items": [], "categories": [], "products": []}
        return web.Response(text=json.dumps(data), content_type="application/json")

    async def post(self, request: web.Request) -> web.Response:
        try:
            body = await request.json()
        except Exception:
            return web.Response(status=400, text="Invalid JSON")
        await self._store.async_save(body)
        return web.Response(text=json.dumps({"ok": True}), content_type="application/json")
