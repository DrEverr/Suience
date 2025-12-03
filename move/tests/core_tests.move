#[test_only]
module suience::core_tests;

use suience::core::{Self, SuiencePlatform, ResearchProfile, ResearchProfileCap};
use std::string;

#[test]
fun test_init_creates_platform() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    {
        core::init_for_testing(scenario.ctx());
    };
    scenario.next_tx(@0x1);
    {
        let platform = scenario.take_shared<SuiencePlatform>();
        assert!(platform.total_profiles() == 0, 0);
        scenario.return_shared(platform);
    };
    scenario.end();
}

#[test]
fun test_create_research_profile() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    {
        core::init_for_testing(scenario.ctx());
    };
    scenario.next_tx(@0x1);
    {
        let mut platform = scenario.take_shared<SuiencePlatform>();
        let name = string::utf8(b"Alice Researcher");

        let cap = core::create_research_profile(&mut platform, name, scenario.ctx());
        let profile_id = core::get_profile_id(&cap);

        assert!(platform.total_profiles() == 1, 0);

        sui::transfer::transfer(cap, @0x1);
        scenario.return_shared(platform);
    };
    scenario.next_tx(@0x1);
    {
        let platform = scenario.take_shared<SuiencePlatform>();
        assert!(scenario.has_most_recent_shared<ResearchProfile>(), 1);
        scenario.return_shared(platform);
    };
    scenario.end();
}

#[test]
fun test_register_research_profile() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    {
        core::init_for_testing(scenario.ctx());
    };
    scenario.next_tx(@0x1);
    {
        let mut platform = scenario.take_shared<SuiencePlatform>();
        let name = string::utf8(b"Bob Researcher");

        core::register_research_profile(&mut platform, name, scenario.ctx());

        assert!(platform.total_profiles() == 1, 0);
        scenario.return_shared(platform);
    };
    scenario.next_tx(@0x1);
    {
        assert!(scenario.has_most_recent_for_sender<ResearchProfileCap>(), 1);
    };
    scenario.end();
}

#[test]
fun test_create_multiple_profiles() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    {
        core::init_for_testing(scenario.ctx());
    };

    // Create first profile
    scenario.next_tx(@0x1);
    {
        let mut platform = scenario.take_shared<SuiencePlatform>();
        core::register_research_profile(&mut platform, string::utf8(b"Profile 1"), scenario.ctx());
        scenario.return_shared(platform);
    };

    // Create second profile
    scenario.next_tx(@0x2);
    {
        let mut platform = scenario.take_shared<SuiencePlatform>();
        core::register_research_profile(&mut platform, string::utf8(b"Profile 2"), scenario.ctx());
        scenario.return_shared(platform);
    };

    // Create third profile
    scenario.next_tx(@0x3);
    {
        let mut platform = scenario.take_shared<SuiencePlatform>();
        core::register_research_profile(&mut platform, string::utf8(b"Profile 3"), scenario.ctx());
        assert!(platform.total_profiles() == 3, 0);
        scenario.return_shared(platform);
    };

    scenario.end();
}

#[test]
fun test_get_profile_id() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    {
        core::init_for_testing(scenario.ctx());
    };
    scenario.next_tx(@0x1);
    {
        let mut platform = scenario.take_shared<SuiencePlatform>();
        core::register_research_profile(&mut platform, string::utf8(b"Test Profile"), scenario.ctx());
        scenario.return_shared(platform);
    };
    scenario.next_tx(@0x1);
    {
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        let profile_id = core::get_profile_id(&cap);

        // Profile ID should be a valid object::ID
        assert!(object::id_to_address(&profile_id) != @0x0, 0);

        scenario.return_to_sender(cap);
    };
    scenario.end();
}

#[test]
fun test_profile_counter_increments() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    {
        core::init_for_testing(scenario.ctx());
    };

    scenario.next_tx(@0x1);
    {
        let platform = scenario.take_shared<SuiencePlatform>();
        assert!(platform.total_profiles() == 0, 0);
        scenario.return_shared(platform);
    };

    scenario.next_tx(@0x1);
    {
        let mut platform = scenario.take_shared<SuiencePlatform>();
        core::register_research_profile(&mut platform, string::utf8(b"Profile 1"), scenario.ctx());
        assert!(platform.total_profiles() == 1, 1);
        scenario.return_shared(platform);
    };

    scenario.next_tx(@0x2);
    {
        let mut platform = scenario.take_shared<SuiencePlatform>();
        core::register_research_profile(&mut platform, string::utf8(b"Profile 2"), scenario.ctx());
        assert!(platform.total_profiles() == 2, 2);
        scenario.return_shared(platform);
    };

    scenario.end();
}
