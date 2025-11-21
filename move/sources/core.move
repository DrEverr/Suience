module suience::core;

use sui::tx_context::TxContext;

struct SuiencePlatform has key {
    id: UID,
    total_papers: u64,
    total_researchers: u64,
    total_reviews: u64,
}

struct ResearchProfile has key {
    id: UID,
    name: String,
    papers_published: u64,
    reviews_completed: u64,
    data_shared: u64,
    citation_count: u64,
    reputarion_score: u64,
}

struct ResearchProfileCap has key {
    id: UID,
    profile_id: ID,
}

fun init(ctx: &mut TxContext) {
    let platform = SuiencePlatform {
        id: object::new(ctx),
        total_papers: 0,
        total_researchers: 0,
        total_reviews: 0,
    };

    transfer::share_object(platform);
}

public fun create_research_profile(
    platform: &mut SuiencePlatform,
    name: String,
    ctx: &mut TxContext
): ResearchProfileCap {
    let profile = ResearchProfile {
        id: object::new(ctx),
        name,
        creator: tx_context::sender(ctx),
        papers_published: 0,
        reviews_completed: 0,
        data_shared: 0,
        citation_count: 0,
        reputarion_score: 0,
    };
    let cap = ResearchProfileCap {
        id: object::new(ctx),
        profile_id: object::id(&profile),
    };

    platform.total_researchers = platform.total_researchers + 1;
    transfer::share_object(profile);
    cap
}

public fun register_research_profile(
    platform: &mut SuiencePlatform,
    name: String,
    ctx: &mut TxContext
) {
    transfer::transfer(create_research_profile(platform, name, ctx), ctx.sender());
}
