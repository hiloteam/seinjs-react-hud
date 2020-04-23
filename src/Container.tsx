/**
 * @File   : Container.tsx
 * @Author : dtysky (dtysky@outlook.com)
 * @Date   : 10/31/2018, 11:48:53 AM
 * @Description:
 */
import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as Sein from 'seinjs';
import 'seinjs-dom-hud';

import {Provider} from './Context';

/**
 * `ReactHUD`组件的`Props`
 */
export interface IContainerProps {
  /**
   * 要生成的对应HUDActor的名字。
   */
  name: string;
  /**
   * 要添加HUD到的游戏。
   */
  game: Sein.Game;
  /**
   * HUDActor要同步到的目标。
   */
  target?: Sein.SceneActor | Sein.SceneComponent;
  /**
   * HUDActor是否为持久的。
   */
  persistent?: boolean;
  /**
   * HUDActor的DOM相对于目标的横向偏移（像素）。
   */
  offsetX?: number;
  /**
   * HUDActor的DOM相对于目标的纵向偏移（像素）。
   */
  offsetY?: number;
  /**
   * HUDActor是否只同步一次，而不跟随。
   * 
   * @default false
   */
  linkOnce?: boolean;
  /**
   * HUDActor销毁时将会触发的回调，可以交由顶层组件完成一些控制。
   */
  onHUDDestroy?: () => void;
  /**
   * 与通常React组件的Children一致。
   */
  children?: React.ReactChild | JSX.Element[];
  /**
   * 追加给DOM的className。
   */
  className?: string;
  /**
   * 追加给DOM的style。
   */
  style?: React.CSSProperties;
  [key: string]: any;
}

/**
 * 基于React的HUD类，本质上是`DomHUD`的一个封装，使用React渲染出的DOM来作为`DomHUD`的DOM。
 * 通常配合[Consumer](../README.md#consumer)一起使用。
 * 详细使用可以见官网的**HUD**的引导
 * 
 * @noInheritDoc
 */
export default class Container extends React.PureComponent<IContainerProps, {ready: boolean}> {
  /**
   * @hidden
   */
  public static defaultProps: IContainerProps = {
    name: '',
    className: '',
    style: {},
    game: null,
    target: null,
    persistent: true,
    offsetX: 0,
    offsetY: 0,
    linkOnce: false
  };

  /**
   * @hidden
   */
  public state: {ready: boolean} = {
    ready: false
  };

  protected _hudActor: Sein.DomHUD.Actor;
  protected _dom: React.RefObject<HTMLDivElement> = React.createRef();

  /**
   * @hidden
   */
  public componentWillMount() {
    Sein.DomHUD.Actor.INIT(this.props.game);
  }

  /**
   * @hidden
   */
  public componentDidMount() {
    if (this.props.game.level) {
      this.handleLevelInit();
    } else {
      this.props.game.event.addOnce('LevelDidInit', this.handleLevelInit);
    }
  }

  /**
   * @hidden
   */
  public componentWillReceiveProps(nextProps: IContainerProps) {
    const {name, target, offsetX, offsetY, persistent} = nextProps;

    if (target !== this.props.target && target) {
      this.link(nextProps); 
    }

    if (!target) {
      this._hudActor.unLink();
    }

    if (name !== this.props.name) {
      this._hudActor.rename(name);
    }

    this._hudActor.offsetX = offsetX;
    this._hudActor.offsetY = offsetY;

    this._hudActor.persistent = persistent;
  }

  /**
   * @hidden
   */
  public componentWillUnmount() {
    if (this._hudActor) {
      this._hudActor.removeFromParent();
    }
  }

  protected link(props: IContainerProps) {
    const {target, linkOnce, offsetX, offsetY} = props;

    if (Sein.isActor(target)) {
      if (!linkOnce) {
        this._hudActor.linkToActor(target, offsetX, offsetY);
      } else {
        this._hudActor.syncToActor(target, offsetX, offsetY);
      }
    } else {
      if (!linkOnce) {
        this._hudActor.linkToComponent(target, offsetX, offsetY);
      } else {
        this._hudActor.syncToComponent(target, offsetX, offsetY);
      }
    }
  }

  protected handleLevelInit = () => {
    this.props.game.event.remove('LevelDidInit', this.handleLevelInit);

    const {name, game, target, persistent} = this.props;

    if (!name) {
      throw new Error('You must give a hud name');
    }

    this._hudActor = game.world.addActor(name, Sein.DomHUD.Actor, {
      dom: this._dom.current,
      autoMount: false
    });

    this._hudActor.event.add('Destroy', this.handleHUDDestroy);

    if (target) {
      this.link(this.props);
    }

    this._hudActor.persistent = persistent;

    setTimeout(() => {
      this.setState({ready: true});
    }, 20);
  }

  protected handleHUDDestroy = () => {
    this._hudActor = null;
    this.props.game.event.remove('LevelDidInit', this.handleLevelInit);

    if (this.props.onHUDDestroy) {
      this.props.onHUDDestroy();
    }
  }

  /**
   * @hidden
   */
  public render() {
    const {
      className,
      style,
      game,
      children,
      name,
      target,
      persistent,
      offsetX,
      offsetY,
      linkOnce,
      ...others
    } = this.props;

    return ReactDom.createPortal(
      <div
        ref={this._dom}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          visibility: this.state.ready ? 'visible' : 'hidden',
          ...(style as any)
        }}
        className={className}
        {...others}
      >
        <Provider
          value={{
            hudActor: this._hudActor,
            game: this.props.game
          }}
        >
          {this._hudActor && children}
        </Provider>
      </div>,
      Sein.DomHUD.Actor.GET_CONTAINER(game)
    );
  }
}
