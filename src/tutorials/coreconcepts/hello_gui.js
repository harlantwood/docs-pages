const path = require('path');
const tape = require('tape');

const {
  Config,
  Orchestrator,
  tapeExecutor,
  singleConductor,
  combine,
} = require('@holochain/try-o-rama');

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.error('got unhandledRejection:', error);
});

const dnaPath = path.join(__dirname, '../dist/cc_tuts.dna.json');

const orchestrator = new Orchestrator({
  middleware: combine(singleConductor, tapeExecutor(tape)),
  globalConfig: {
    logger: false,
    network: {
      type: 'sim2h',
      sim2h_url: 'wss://sim2h.holochain.org:9000',
    },
  },
});

const config = {
  instances: {
    cc_tuts: Config.dna(dnaPath, 'cc_tuts'),
  },
};

orchestrator.registerScenario('Test hello holo', async (s, t) => {
  const {alice, bob} = await s.players({alice: config, bob: config}, true);
  const result = await alice.call('cc_tuts', 'hello', 'hello_holo', {});
  t.ok(result.Ok);

  t.deepEqual(result, {Ok: 'Hello Holo'});

  const timestamp = Date.now();
  const create_result = await alice.call('cc_tuts', 'hello', 'create_post', {
    message: 'Hello blog',
    timestamp: timestamp,
  });
  t.ok(create_result.Ok);

  await s.consistency();

  const alice_address = alice.instance('cc_tuts').agentAddress;

  const retrieve_result = await alice.call(
    'cc_tuts',
    'hello',
    'retrieve_posts',
    {agent_address: alice_address},
  );
  t.ok(retrieve_result.Ok);
  const alice_posts = retrieve_result.Ok;
  var post = {
    message: 'Hello blog',
    timestamp: timestamp,
    author_id: alice_address,
  };
  t.deepEqual(alice_posts, [post]);

  await s.consistency();

  const bob_retrieve_result = await bob.call(
    'cc_tuts',
    'hello',
    'retrieve_posts',
    {agent_address: alice_address},
  );
  t.ok(bob_retrieve_result.Ok);
  const alice_posts_bob = bob_retrieve_result.Ok;
  t.deepEqual(alice_posts_bob, [post]);
});
orchestrator.run();
