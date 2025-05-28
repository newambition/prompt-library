# This file makes Python treat the directory 'crud' as a package.

from .crud_api_keys import (
    create_user_api_key,
    get_user_api_keys,
    get_decrypted_api_key,
    update_user_api_key,
    delete_user_api_key,
    _get_fernet_instance, # Exposing for potential direct use or testing if needed
    _mask_api_key # Exposing for potential direct use or testing if needed
)

from .crud_prompts import (
    get_next_prompt_id_db,
    get_next_version_id_db,
    get_current_date_str,
    _map_prompt_db_to_schema,
    get_prompt_by_prompt_id,
    get_prompts,
    create_db_prompt,
    delete_db_prompt,
    update_db_prompt,
    create_db_version,
    update_db_version_notes,
    add_db_tag,
    remove_db_tag
)

from .crud_users import (
    get_user_by_auth0_id,
    get_user_by_user_id,
    create_user,
    update_user_subscription,
    get_user_by_stripe_customer_id,
    get_user_tier_and_status,
    get_or_create_user_from_auth0,
    count_user_prompts,
    count_prompt_versions
)

__all__ = [
    # API Key CRUD functions
    "create_user_api_key",
    "get_user_api_keys",
    "get_decrypted_api_key",
    "update_user_api_key",
    "delete_user_api_key",
    "_get_fernet_instance",
    "_mask_api_key",

    # Prompt, Version, and Tag CRUD functions
    "get_next_prompt_id_db",
    "get_next_version_id_db",
    "get_current_date_str",
    "_map_prompt_db_to_schema",
    "get_prompt_by_prompt_id",
    "get_prompts",
    "create_db_prompt",
    "delete_db_prompt",
    "update_db_prompt",
    "create_db_version",
    "update_db_version_notes",
    "add_db_tag",
    "remove_db_tag",

    # User CRUD functions
    "get_user_by_auth0_id",
    "get_user_by_user_id",
    "create_user",
    "update_user_subscription",
    "get_user_by_stripe_customer_id",
    "get_user_tier_and_status",
    "get_or_create_user_from_auth0",
    "count_user_prompts",
    "count_prompt_versions",
] 