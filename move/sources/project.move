module suience::project;

use suience::core::{Self, ResearchProfile, ResearchProfileCap};
use suience::utils::is_prefix;

use sui::table;
use sui::dynamic_field as df;
use std::string::String;

// Errors
const EInvalidCap: u64 = 0;
const EDuplicate: u64 = 1;
const ENotOnList: u64 = 2;
const ENoAccess: u64 = 3;
const EWrongVersion: u64 = 4;

// Markers
const PAPER_MARKER: u64 = 100;
const DATA_MARKER: u64 = 101;

const VERSION: u64 = 1;

public struct Project has key {
    id: object::UID,
    version: u64,
    name: String,
    // Collaborators get full access
    collaborators: table::Table<address, bool>,
    // Institutional access for funders
    institutions: table::Table<address, bool>,
}

public struct ProjectCap has key {
    id: object::UID,
    project_id: object::ID,
}

public fun create_project(
    profile: &mut ResearchProfile,
    cap: &ResearchProfileCap,
    name: String,
    ctx: &mut tx_context::TxContext,
): ProjectCap {
    assert!(core::get_profile_id(cap) == object::id(profile), EInvalidCap);

    let project_uid = object::new(ctx);
    let project_id = object::uid_to_inner(&project_uid);

    let project = Project {
        id: project_uid,
        version: VERSION,
        name,
        collaborators: table::new(ctx),
        institutions: table::new(ctx),
    };

    let project_cap = ProjectCap {
        id: object::new(ctx),
        project_id,
    };

    transfer::share_object(project);
    project_cap
}

public fun register_project(
    profile: &mut ResearchProfile,
    cap: &ResearchProfileCap,
    name: String,
    ctx: &mut tx_context::TxContext,
) {
    sui::transfer::transfer(create_project(profile, cap, name, ctx), tx_context::sender(ctx));
}

public fun publish_paper(project: &mut Project, cap: &ProjectCap, blob_id: String) {
    assert!(cap.project_id == object::id(project), EInvalidCap);
    df::add(&mut project.id, blob_id, PAPER_MARKER);
}

public fun publish_data(project: &mut Project, cap: &ProjectCap, blob_id: String) {
    assert!(cap.project_id == object::id(project), EInvalidCap);
    df::add(&mut project.id, blob_id, DATA_MARKER);
}

public fun add_collaborator(project: &mut Project, cap: &ProjectCap, account: address) {
    assert!(cap.project_id == object::id(project), EInvalidCap);
    assert!(!table::contains(&project.collaborators, account), EDuplicate);
    table::add(&mut project.collaborators, account, true);
}

public fun remove_collaborator(project: &mut Project, cap: &ProjectCap, account: address) {
    assert!(cap.project_id == object::id(project), EInvalidCap);
    assert!(table::contains(&project.collaborators, account), ENotOnList);
    table::remove(&mut project.collaborators, account);
}

public fun add_institution(project: &mut Project, cap: &ProjectCap, account: address) {
    assert!(cap.project_id == object::id(project), EInvalidCap);
    assert!(!table::contains(&project.institutions, account), EDuplicate);
    table::add(&mut project.institutions, account, true);
}

public fun remove_institution(project: &mut Project, cap: &ProjectCap, account: address) {
    assert!(cap.project_id == object::id(project), EInvalidCap);
    assert!(table::contains(&project.institutions, account), ENotOnList);
    table::remove(&mut project.institutions, account);
}

//////////////////////////////
/// Access control

fun check_policy(caller: address, id: vector<u8>, project: &Project): bool {
    assert!(project.version == VERSION, EWrongVersion);

    // Check if the id has the right prefix
    let prefix = object::uid_to_bytes(&project.id);
    if (!is_prefix(prefix, id)) {
        return false
    };

    table::contains(&project.collaborators, caller) || table::contains(&project.institutions, caller)
}

entry fun seal_approve(id: vector<u8>, project: &Project, ctx: &tx_context::TxContext) {
    assert!(check_policy(tx_context::sender(ctx), id, project), ENoAccess);
}
