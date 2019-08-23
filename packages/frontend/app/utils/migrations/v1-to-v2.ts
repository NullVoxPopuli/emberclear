import ApplicationInstance from '@ember/application/instance';

/**
 *
 * Migrations:
 *   identities split to user and contacts
 *   - user is the actual user of the app
 *   message relationships were not polymorphic before, and now
 *   will need the sender relationship updated
 *
 *   All other models don't have relationships, so they can just
 *   be resaved.
 *
 *
 *   NOTE: how long should this migration be kept? this'll be just be bloat after it runs.
 *
 */
export async function up(appInstance: ApplicationInstance) {
  const isMigrated = await isAlreadyMigrated(appInstance);

  // second, load all the data
  if (isMigrated) {
    console.debug('Migration not needed');
    return;
  }

  console.debug('migration needed. Converting old data to { json:api } format');
  await migrateIdentities(appInstance);
  await migrateMessages(appInstance);
  await finalize(appInstance);
}

async function finalize(appInstance: ApplicationInstance) {
  const storage = await getStorage(appInstance);

  // these things haven't been ready, and
  // shouldn't exist
  delete storage.channel;
  delete storage.invitation;
  delete storage.messageMedia;

  // these are old data
  delete storage.identity;

  // these will be re-generated
  delete storage.relay;

  await updateStorage(appInstance, storage);
}

async function getStorage(appInstance: ApplicationInstance) {
  let adapter = appInstance.lookup('adapter:application');
  let namespace = adapter._adapterNamespace();

  let storage = await (window as any).localforage.getItem(namespace);

  return storage;
}

async function updateStorage(appInstance: ApplicationInstance, newValue: any) {
  let adapter = appInstance.lookup('adapter:application');
  let namespace = adapter._adapterNamespace();

  await (window as any).localforage.setItem(namespace, newValue);
}

async function migrateMessages(appInstance: ApplicationInstance) {
  const storage = await getStorage(appInstance);
  const messages = (storage.message || {}).records || {};
  const ids = Object.keys(messages);

  ids.forEach(id => {
    const oldRecord = messages[id];
    const isTheUser = oldRecord.sender === 'me';

    storage.message.records[id] = {
      data: {
        id,
        type: 'messages',
        attributes: {
          from: oldRecord.from,
          to: oldRecord.to,
          body: oldRecord.body,
          metadata: oldRecord.metadata,
          type: oldRecord.type,
          target: oldRecord.target,
          thread: oldRecord.thread,
          receivedAt: oldRecord.receivedAt,
          sentAt: oldRecord.sentAt,
          sendError: oldRecord.sendError,
          queueForResend: oldRecord.queueForResend,
        },
        relationships: {
          sender: {
            data: {
              id: oldRecord.sender,
              type: isTheUser ? 'users' : 'contacts',
            },
          },
          deliveryConfirmations: {
            data: (oldRecord.deliveryConfirmations || []).map((confirmation: string) => ({
              type: 'messages',
              id: confirmation,
            })),
          },
        },
      },
    };
  });

  await updateStorage(appInstance, storage);
}

async function migrateIdentities(appInstance: ApplicationInstance) {
  const storage = await getStorage(appInstance);

  storage.user = { records: {} };
  storage.contact = { records: {} };

  const identities = (storage.identity || {}).records || {};
  const ids = Object.keys(identities);

  ids.forEach(id => {
    const oldRecord = identities[id];

    if (id === 'me') {
      storage.user.records[id] = {
        data: {
          id,
          type: 'users',
          attributes: {
            name: oldRecord.name,
            publicKey: oldRecord.publicKey,
            privateKey: oldRecord.privateKey,
          },
          // user has no relationships (currently)
          relationships: {},
        },
      };
    } else {
      storage.contact.records[id] = {
        data: {
          id,
          type: 'contacts',
          attributes: {
            name: oldRecord.name,
            publicKey: oldRecord.publicKey,
            onlineStatus: oldRecord.onlineStatus,
          },
          relationships: {},
        },
      };
    }
  });

  await updateStorage(appInstance, storage);
}

async function isAlreadyMigrated(appInstance: ApplicationInstance) {
  const storage = await getStorage(appInstance);

  if (!storage) {
    return true;
  }

  const storedModels = Object.keys(storage);
  let alreadyMigrated = undefined;

  // Are partial migrations a thing?
  for (let i = 0; i < storedModels.length; i++) {
    let modelName = storedModels[i];
    let records = storage[modelName].records;
    let ids = Object.keys(records);
    let record = records[ids[0]];

    if (record && record.data && record.data.attributes) {
      alreadyMigrated = true && (alreadyMigrated === undefined ? true : alreadyMigrated);
    } else {
      alreadyMigrated = false;
    }
  }

  return alreadyMigrated;
}
