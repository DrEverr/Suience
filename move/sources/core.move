module suience::core;

use std::string::String;

public struct SuiencePlatform has key {
    id: object::UID,
    total_profiles: u64,
}

public struct ResearchProfile has key {
    id: object::UID,
    name: String,
    bio: String,
    orcid: String,
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
    bio: String,
    orcid: String,
    ctx: &mut tx_context::TxContext
): ResearchProfileCap {
    let profile = ResearchProfile {
        id: object::new(ctx),
        name,
        bio,
        orcid,
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
    bio: String,
    orcid: String,
    ctx: &mut tx_context::TxContext
) {
    sui::transfer::transfer(create_research_profile(platform, name, bio, orcid, ctx), tx_context::sender(ctx));
}

public fun get_profile_id(cap: &ResearchProfileCap): object::ID {
    cap.profile_id
}

// Update research profile
public fun update_profile(
    profile: &mut ResearchProfile,
    cap: &ResearchProfileCap,
    name: String,
    bio: String,
    orcid: String,
) {
    assert!(cap.profile_id == object::id(profile), 0);
    profile.name = name;
    profile.bio = bio;
    profile.orcid = orcid;
}
