"""Shopping List — Home Assistant custom integration."""
from __future__ import annotations

import json
import logging
import os
from pathlib import Path

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store
from homeassistant.helpers import config_validation as cv
from homeassistant.config_entries import ConfigEntry
from homeassistant.components.frontend import add_extra_js_url

_LOGGER = logging.getLogger(__name__)

DOMAIN = "shopping_list"
STORAGE_KEY = "shopping_list.data"
STORAGE_VERSION = 1

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

WWW_DIR = Path(__file__).parent / "www"
CARD_FILE = "shopping-list-card.js"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """Set up the Shopping List component."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Shopping List from a config entry."""
    store = Store(hass, STORAGE_VERSION, STORAGE_KEY)

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["store"] = store

    # Register REST API views
    hass.http.register_view(ShoppingListDataView(store))

    # Serve the www directory
    hass.http.register_static_path(
        f"/shopping_list_static",
        str(WWW_DIR),
        cache_headers=False,
    )

    # Auto-register the Lovelace card JS
    card_url = f"/shopping_list_static/{CARD_FILE}"
    add_extra_js_url(hass, card_url)

    _LOGGER.info("Shopping List integration set up, card registered at %s", card_url)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    hass.data[DOMAIN].pop("store", None)
    return True


class ShoppingListDataView(HomeAssistantView):
    """REST API endpoint for Shopping List data."""

    url = "/api/shopping_list/data"
    name = "api:shopping_list:data"
    requires_auth = True

    def __init__(self, store: Store):
        self._store = store

    async def get(self, request: web.Request) -> web.Response:
        """Return stored data."""
        data = await self._store.async_load()
        if data is None:
            data = {"items": [], "categories": [], "products": []}
        return web.Response(
            text=json.dumps(data),
            content_type="application/json",
        )

    async def post(self, request: web.Request) -> web.Response:
        """Save data."""
        try:
            body = await request.json()
        except Exception:
            return web.Response(status=400, text="Invalid JSON")
        await self._store.async_save(body)
        return web.Response(
            text=json.dumps({"ok": True}),
            content_type="application/json",
        )
