module suience::project;

use suience::core::

use sui::tx_context::TxContext;
use sui::dynamic_field as df;
use std::string::String;

// Errors
const EInvalidCap: u64 = 0;
const EDuplicate: u64 = 1;

// Markers
const PAPER_MARKER: u64 = 100;
const DATA_MARKER: u64 = 101;

public struct Project has key {
    id: UID,
    name: String,
    // Collaborators get full access
    collaborators: vector<address>,
    // Institutional access for funders
    institutions: vector<address>,
}

public struct ProjectCap has key {
    id: UID,
    project_id: ID,
}

public fun create_project(
    platform: &mut SuiencePlatform,
    profile: &mut ResearchProfile,
    cap: &ResearchProfileCap,
    name: String,
): ProjectCap {
    assert!(cap.profile_id == object::id(profile), EInvalidCap);
    let project = {
        id: object::new(ctx),
        name,
        collaborators: vector::empty(),
        institutions: vector::empty(),
    };
    let cap = ProjectCap {
        id: object::new(ctx),
        project_id: object::id(project),
    };
    
    platform.total_projects = platform.total_projects + 1;
    profile.projects_published = profile.projects_published + 1;
    transfer::share_object(project);
    cap
}

public fun register_project(
    platform: &mut SuiencePlatform,
    profile: &mut ResearchProfile,
    cap: &ResearchProfileCap,
    name: String,
    ctx: &mut TxContext,
) {
    transfer::transfer(create_project(), ctx.sender());
}

public fun publish_paper(project: &mut Project, cap: &ProjectCap, blob_id: String) {
    assert!(cap.project_id == object::id(project), EInvalidCap);
    df.add(&mut project.id, blob_id, PAPER_MARKER);
}

public fun publish_data(project: &mut Project, cap: &ProjectCap, blob_id: String) {
    assert!(cap.project_id == object::id(project), EInvalidCap);
    df.add(&mut project.id, blob_id, DATA_MARKER);
}

public fun add_collaborator(project: &mut Project, cap: &ProjectCap, account: address) {
    assert!(cap.project_id == object::id(project), EInvalidCap);
    assert!(!project.collaborators.contains(&account), EDuplicate);
    project.collaborators.push_back(account);
}

public fun remove_collaborator(project: &mut Project, cap: &ProjectCap, account: address) {
    assert!(cap.project_id == object::id(project), EInvalidCap);
    project.collaborators = project.collaborators.filter!(|x| x != account);
}

public fun add_institution(project: &mut Project, cap: &ProjectCap, account: address) {
    assert!(cap.project_id == object::id(project), EInvalidCap);
    assert!(!project.institutions.contains(&account), EDuplicate);
    project.institutions.push_back(account);
}

public fun remove_institution(project: &mut Project, cap: &ProjectCap, account: address) {
    assert!(cap.project_id == object::id(project), EInvalidCap);
    project.institutions = project.institutions.filter!(|x| x != account);
}
