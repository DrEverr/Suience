#[test_only]
module suience::project_tests;

use suience::core::{Self, SuiencePlatform, ResearchProfile, ResearchProfileCap};
use suience::project::{Self, Project, ProjectCap};
use std::string;

// Test helper function to setup platform and profile
fun setup_platform_and_profile(scenario: &mut sui::test_scenario::Scenario, user: address) {
    scenario.next_tx(user);
    {
        core::init_for_testing(scenario.ctx());
    };
    scenario.next_tx(user);
    {
        let mut platform = scenario.take_shared<SuiencePlatform>();
        core::register_research_profile(&mut platform, string::utf8(b"Test Researcher"), scenario.ctx());
        scenario.return_shared(platform);
    };
}

#[test]
fun test_create_project() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();

        let project_cap = project::create_project(
            &mut profile,
            &cap,
            string::utf8(b"Test Project"),
            scenario.ctx()
        );

        sui::transfer::transfer(project_cap, @0x1);
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        assert!(scenario.has_most_recent_shared<Project>(), 0);
        assert!(scenario.has_most_recent_for_sender<ProjectCap>(), 1);
    };

    scenario.end();
}

#[test]
fun test_register_project() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();

        project::register_project(
            &mut profile,
            &cap,
            string::utf8(b"My Research Project"),
            scenario.ctx()
        );

        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        assert!(scenario.has_most_recent_for_sender<ProjectCap>(), 0);
    };

    scenario.end();
}

#[test]
#[expected_failure(abort_code = project::EInvalidCap)]
fun test_create_project_with_wrong_cap() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    // Create a second profile
    scenario.next_tx(@0x2);
    {
        let mut platform = scenario.take_shared<SuiencePlatform>();
        core::register_research_profile(&mut platform, string::utf8(b"Another Researcher"), scenario.ctx());
        scenario.return_shared(platform);
    };

    // Try to create project for profile 1 with cap from profile 2
    scenario.next_tx(@0x2);
    {
        let mut profile1 = scenario.take_shared<ResearchProfile>();
        let cap2 = scenario.take_from_sender<ResearchProfileCap>();

        let project_cap = project::create_project(
            &mut profile1,
            &cap2,
            string::utf8(b"Invalid Project"),
            scenario.ctx()
        );

        sui::transfer::transfer(project_cap, @0x2);
        scenario.return_to_sender(cap2);
        scenario.return_shared(profile1);
    };

    scenario.end();
}

#[test]
fun test_publish_paper() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Research"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::publish_paper(&mut project_obj, &project_cap, string::utf8(b"paper_blob_123"));

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
fun test_publish_data() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Data Project"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::publish_data(&mut project_obj, &project_cap, string::utf8(b"data_blob_456"));

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
fun test_publish_multiple_papers() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Multi Paper"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::publish_paper(&mut project_obj, &project_cap, string::utf8(b"paper1"));
        project::publish_paper(&mut project_obj, &project_cap, string::utf8(b"paper2"));
        project::publish_paper(&mut project_obj, &project_cap, string::utf8(b"paper3"));

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
#[expected_failure(abort_code = project::EInvalidCap)]
fun test_publish_paper_with_wrong_cap() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    // Create two projects
    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Project 1"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        let project_cap2 = project::create_project(&mut profile, &cap, string::utf8(b"Project 2"), scenario.ctx());
        sui::transfer::transfer(project_cap2, @0x1);
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    // Try to publish to project 1 with cap from project 2
    scenario.next_tx(@0x1);
    {
        let project_cap1 = scenario.take_from_sender<ProjectCap>();

        scenario.next_tx(@0x1);
        let mut project1 = scenario.take_shared<Project>();
        let project_cap2 = scenario.take_from_sender<ProjectCap>();

        project::publish_paper(&mut project1, &project_cap2, string::utf8(b"invalid"));

        scenario.return_to_sender(project_cap1);
        scenario.return_to_sender(project_cap2);
        scenario.return_shared(project1);
    };

    scenario.end();
}

#[test]
fun test_add_collaborator() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Collab Project"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::add_collaborator(&mut project_obj, &project_cap, @0x2);

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
fun test_add_multiple_collaborators() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Team Project"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::add_collaborator(&mut project_obj, &project_cap, @0x2);
        project::add_collaborator(&mut project_obj, &project_cap, @0x3);
        project::add_collaborator(&mut project_obj, &project_cap, @0x4);

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
#[expected_failure(abort_code = project::EDuplicate)]
fun test_add_duplicate_collaborator() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Project"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::add_collaborator(&mut project_obj, &project_cap, @0x2);
        project::add_collaborator(&mut project_obj, &project_cap, @0x2); // Should fail

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
fun test_remove_collaborator() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Project"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::add_collaborator(&mut project_obj, &project_cap, @0x2);
        project::remove_collaborator(&mut project_obj, &project_cap, @0x2);

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
#[expected_failure(abort_code = project::ENotOnList)]
fun test_remove_nonexistent_collaborator() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Project"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::remove_collaborator(&mut project_obj, &project_cap, @0x2); // Should fail

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
fun test_add_institution() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Funded Project"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::add_institution(&mut project_obj, &project_cap, @0xABC);

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
fun test_add_multiple_institutions() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Multi-Funded"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::add_institution(&mut project_obj, &project_cap, @0xABC);
        project::add_institution(&mut project_obj, &project_cap, @0xDEF);
        project::add_institution(&mut project_obj, &project_cap, @0x123);

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
#[expected_failure(abort_code = project::EDuplicate)]
fun test_add_duplicate_institution() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Project"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::add_institution(&mut project_obj, &project_cap, @0xABC);
        project::add_institution(&mut project_obj, &project_cap, @0xABC); // Should fail

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
fun test_remove_institution() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Project"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::add_institution(&mut project_obj, &project_cap, @0xABC);
        project::remove_institution(&mut project_obj, &project_cap, @0xABC);

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
#[expected_failure(abort_code = project::ENotOnList)]
fun test_remove_nonexistent_institution() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Project"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::remove_institution(&mut project_obj, &project_cap, @0xABC); // Should fail

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
fun test_seal_approve_with_collaborator() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Access Project"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::add_collaborator(&mut project_obj, &project_cap, @0x2);

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.next_tx(@0x2);
    {
        let project_obj = scenario.take_shared<Project>();
        let project_id = object::uid_to_bytes(&project_obj.id);

        project::seal_approve(project_id, &project_obj, scenario.ctx());

        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
fun test_seal_approve_with_institution() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Funded Research"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::add_institution(&mut project_obj, &project_cap, @0xFFF);

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.next_tx(@0xFFF);
    {
        let project_obj = scenario.take_shared<Project>();
        let project_id = object::uid_to_bytes(&project_obj.id);

        project::seal_approve(project_id, &project_obj, scenario.ctx());

        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
#[expected_failure(abort_code = project::ENoAccess)]
fun test_seal_approve_unauthorized() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Private Project"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x2);
    {
        let project_obj = scenario.take_shared<Project>();
        let project_id = object::uid_to_bytes(&project_obj.id);

        project::seal_approve(project_id, &project_obj, scenario.ctx()); // Should fail

        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
#[expected_failure(abort_code = project::ENoAccess)]
fun test_seal_approve_wrong_prefix() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Project"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::add_collaborator(&mut project_obj, &project_cap, @0x2);

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    scenario.next_tx(@0x2);
    {
        let project_obj = scenario.take_shared<Project>();
        let wrong_id = b"wrong_prefix_bytes";

        project::seal_approve(wrong_id, &project_obj, scenario.ctx()); // Should fail

        scenario.return_shared(project_obj);
    };

    scenario.end();
}

#[test]
fun test_complete_workflow() {
    let mut scenario = sui::test_scenario::begin(@0x1);
    setup_platform_and_profile(&mut scenario, @0x1);

    // Create project
    scenario.next_tx(@0x1);
    {
        let mut profile = scenario.take_shared<ResearchProfile>();
        let cap = scenario.take_from_sender<ResearchProfileCap>();
        project::register_project(&mut profile, &cap, string::utf8(b"Complete Project"), scenario.ctx());
        scenario.return_to_sender(cap);
        scenario.return_shared(profile);
    };

    // Add collaborators and institutions
    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::add_collaborator(&mut project_obj, &project_cap, @0x2);
        project::add_collaborator(&mut project_obj, &project_cap, @0x3);
        project::add_institution(&mut project_obj, &project_cap, @0xAAA);

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    // Publish papers and data
    scenario.next_tx(@0x1);
    {
        let mut project_obj = scenario.take_shared<Project>();
        let project_cap = scenario.take_from_sender<ProjectCap>();

        project::publish_paper(&mut project_obj, &project_cap, string::utf8(b"paper1"));
        project::publish_paper(&mut project_obj, &project_cap, string::utf8(b"paper2"));
        project::publish_data(&mut project_obj, &project_cap, string::utf8(b"dataset1"));

        scenario.return_to_sender(project_cap);
        scenario.return_shared(project_obj);
    };

    // Verify access control works
    scenario.next_tx(@0x2);
    {
        let project_obj = scenario.take_shared<Project>();
        let project_id = object::uid_to_bytes(&project_obj.id);
        project::seal_approve(project_id, &project_obj, scenario.ctx());
        scenario.return_shared(project_obj);
    };

    scenario.end();
}
