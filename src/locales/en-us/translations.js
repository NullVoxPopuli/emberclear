export default {
  appname: 'emberclear',
  subheader: 'Encrypted Chat. No History. No Logs.',
  authoredBy: 'by Preston Sego',

  connection: {
    connecting: 'Connecting...',

    log: {
      push: {
        ok: 'push: created. {{msg}}',
        error: 'push: message failed. {{reasons}}',
        timeout: 'push: Networking issue',
      },
    },

    status: {
      socket: {
        error: 'An error occurred in the socket connection!',
        close: 'The socket connection has been dropped!',
      },
      timeout: 'There is a networking issue. waiting...',
    },

    errors: {
      send: {
        notConnected: 'Cannot send messages without a connection!',
      },
      subscribe: {
        notConnected: 'Cannot subscribe to a channel without a socket connection!',
      },
    },
  },
  buttons: {
    next: 'Next',
    back: 'Back',
    begin: 'Begin',
  },
  services: {
    crypto: {
      keyGenFailed: 'Key Generation Failed',
    },
  },
  routes: {
    home: 'Home',
    chat: 'Chat',
    profile: 'Profile',
    faq: 'F.A.Q.',
  },
  ui: {
    faq: {
      title: 'F.A.Q',
      whatIsQ: 'What is {{appname}}',
      whatIsA: `
        EmberClear is the open source p2p encrypted chat
        client that operates over open source
        mesh nodes on free-tier cloud services.
      `,
      howDoesWorkQ: 'How does it work?',
      howDoesWorkA: ``,
      whyQ: 'Why?',
      whyA: ``,
    },
    footer: {
      navigation: 'Navigation',
      wantToSupport: 'Want to support this project?',
      license: `
        The <a href='https://github.com/NullVoxPopuli/emberclear' target='_blank'>source code</a>
        uses the <a href="http://opensource.org/licenses/mit-license.php" target='_blank'>MIT</a> license.
      `,
    },
    login: {
      title: 'Login',
      instructions: 'Please paste or type your mnemonic key.',
    },
    setup: {
      overwriteTitle: 'Are you sure you want to create a new identity?',
      introQuestion: 'What would you like to be called?',
      almostReady: 'You are almost ready to begin chatting!',
      nameLabel: 'This is how others will identify you',
      mnemonicPrompt: `
        If you would like to use this account on other computers,
        please store this mnemonic in a secure place. It will be used
        to login.`,
      note: `
        You may download your settings at any time so that you can upload
        them to another computer. The settings will include more than just
        your identity.
      `,
    },
  },
};
