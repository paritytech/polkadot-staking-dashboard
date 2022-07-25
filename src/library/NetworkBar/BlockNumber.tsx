// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { motion } from 'framer-motion';
import { APIContext } from 'contexts/Api';

export const BlockNumberInner = (props: any) => {
  return (
    <motion.div animate={{ opacity: [0.5, 1] }} transition={{ duration: 0.5 }}>
      {props.block}
    </motion.div>
  );
};

export class BlockNumber extends React.Component<any, any> {
  static contextType = APIContext;

  stateRef: any;

  constructor(props: any) {
    super(props);
    this.state = {
      block: 0,
      unsub: null,
    };

    this.stateRef = React.createRef();
    this.stateRef.current = this.state;
  }

  componentDidMount() {
    this.initiateBlockSubscription();
  }

  componentDidUpdate() {
    if (this.state.unsub === null) {
      this.initiateBlockSubscription();
    }
  }

  componentWillUnmount() {
    const { unsub } = this.state;
    if (unsub !== null) {
      unsub();
    }
  }

  initiateBlockSubscription = async () => {
    const { api, isReady }: any = this.context;

    if (isReady) {
      const unsub = await api.rpc.chain.subscribeNewHeads((block: any) => {
        if (block !== undefined) {
          this._setState({
            ...this.stateRef.current,
            block: `#${block.number.toHuman()}`,
          });
        }
      });

      this._setState({
        ...this.stateRef.current,
        unsub,
      });
    }
  };

  _setState(_state: any) {
    this.stateRef.current = _state;
    this.setState(_state);
  }

  render() {
    return <BlockNumberInner {...this.props} block={this.state.block} />;
  }
}

export default BlockNumber;
