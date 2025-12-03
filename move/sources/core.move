module suience::core;

use std::string::String;

public struct SuiencePlatform has key {
    id: object::UID,
    total_profiles: u64,
}

public struct ResearchProfile has key {
    id: object::UID,
    name: String,
}

public struct ResearchProfileCap has key {
    id: object::UID,
    profile_id: object::ID,
}

fun init(ctx: &mut tx_context::TxContext) {
    let platform = SuiencePlatform {
        id: object::new(ctx),
        total_profiles: 0,
    };

    sui::transfer::share_object(platform);
}

public fun create_research_profile(
    platform: &mut SuiencePlatform,
    name: String,
    ctx: &mut tx_context::TxContext
): ResearchProfileCap {
    let profile = ResearchProfile {
        id: object::new(ctx),
        name,
    };
    let cap = ResearchProfileCap {
        id: object::new(ctx),
        profile_id: object::id(&profile),
    };
    
    platform.total_profiles = platform.total_profiles + 1;
    sui::transfer::share_object(profile);
    cap
}

// Register new research profile
public fun register_research_profile(
    platform: &mut SuiencePlatform,
    name: String,
    ctx: &mut tx_context::TxContext
) {
    sui::transfer::transfer(create_research_profile(platform, name, ctx), tx_context::sender(ctx));
}

public fun get_profile_id(cap: &ResearchProfileCap): object::ID {
    cap.profile_id
}

public fun total_profiles(platform: &SuiencePlatform): u64 {
    platform.total_profiles
}

#[test_only]
public fun init_for_testing(ctx: &mut tx_context::TxContext) {
    init(ctx);
}
