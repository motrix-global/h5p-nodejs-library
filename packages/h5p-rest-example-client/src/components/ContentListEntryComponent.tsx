import React from 'react';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFingerprint,
    faBookOpen,
    faWindowClose,
    faSave,
    faCheck,
    faPlay,
    faPencilAlt,
    faFileDownload,
    faTrashAlt
} from '@fortawesome/free-solid-svg-icons';

import { H5PEditorUI, H5PPlayerUI } from '@lumieducation/h5p-react';

import { IContentListEntry, IContentService } from '../services/ContentService';
import './ContentListEntryComponent.css';

export default class ContentListEntryComponent extends React.Component<{
    contentService: IContentService;
    data: IContentListEntry;
    onDelete: (content: IContentListEntry) => void;
    onDiscard: (content: IContentListEntry) => void;
    onSaved: (data: IContentListEntry) => void;
    generateDownloadLink: (contentId: string) => string;
}> {
    constructor(props: {
        contentService: IContentService;
        data: IContentListEntry;
        onDiscard: (content: IContentListEntry) => void;
        onDelete: (content: IContentListEntry) => void;
        onSaved: (data: IContentListEntry) => void;
        generateDownloadLink: (contentId: string) => string;
    }) {
        super(props);
        this.state = {
            editing: props.data.contentId === 'new',
            playing: false,
            saving: false,
            saved: false,
            loading: true,
            saveErrorMessage: '',
            saveError: false
        };
        this.h5pEditor = React.createRef();
        this.saveButton = React.createRef();
        this.h5pPlayer = React.createRef();
    }

    public state: {
        editing: boolean;
        loading: boolean;
        playing: boolean;
        saved: boolean;
        saving: boolean;
        saveError: boolean;
        saveErrorMessage: string;
    };

    private h5pPlayer: React.RefObject<H5PPlayerUI>;
    private h5pEditor: React.RefObject<H5PEditorUI>;
    private saveButton: React.RefObject<HTMLButtonElement>;

    public render(): React.ReactNode {
        return (
            <ListGroupItem
                key={
                    this.props.data.originalNewKey ?? this.props.data.contentId
                }
            >
                <Container>
                    <Row>
                        <Col className="p-2">
                            <h5>{this.props.data.title}</h5>
                            <Row className="small">
                                <Col className="mr-2" lg="auto">
                                    <FontAwesomeIcon
                                        icon={faBookOpen}
                                        className="mr-1"
                                    />
                                    {this.props.data.mainLibrary}
                                </Col>
                                <Col className="mr-2" lg="auto">
                                    <FontAwesomeIcon
                                        icon={faFingerprint}
                                        className="mr-1"
                                    />
                                    {this.props.data.contentId}
                                </Col>
                            </Row>
                        </Col>
                        {this.state.playing ? (
                            <Col className="p-2" lg="auto">
                                <Button
                                    variant="light"
                                    onClick={() => this.close()}
                                    block
                                >
                                    <FontAwesomeIcon
                                        icon={faWindowClose}
                                        className="mr-2"
                                    />
                                    close player
                                </Button>
                            </Col>
                        ) : undefined}
                        {this.state.editing ? (
                            <Col className="p-2" lg="auto">
                                <Overlay
                                    target={this.saveButton.current}
                                    show={this.state.saveError}
                                    placement="right"
                                >
                                    <Tooltip id="error-tooltip">
                                        {this.state.saveErrorMessage}
                                    </Tooltip>
                                </Overlay>
                                <Button
                                    ref={this.saveButton}
                                    variant="primary"
                                    className={
                                        this.state.saving || this.state.loading
                                            ? 'disabled'
                                            : ''
                                    }
                                    disabled={
                                        this.state.saving || this.state.loading
                                    }
                                    onClick={() => this.save()}
                                    block
                                >
                                    {this.state.saving ? (
                                        <div
                                            className="spinner-border spinner-border-sm m-1 align-middle"
                                            role="status"
                                        ></div>
                                    ) : (
                                        <FontAwesomeIcon
                                            icon={faSave}
                                            className="mr-2"
                                        />
                                    )}{' '}
                                    save{' '}
                                    {this.state.saved ? (
                                        <FontAwesomeIcon
                                            icon={faCheck}
                                            className="mr-2"
                                        />
                                    ) : undefined}
                                </Button>
                            </Col>
                        ) : undefined}
                        {this.state.editing && !this.isNew() ? (
                            <Col className="p-2" lg="auto">
                                <Button
                                    variant="light"
                                    block
                                    onClick={() => this.close()}
                                >
                                    <FontAwesomeIcon
                                        icon={faWindowClose}
                                        className="mr-2"
                                    />
                                    close editor
                                </Button>
                            </Col>
                        ) : undefined}
                        {this.state.editing && this.isNew() ? (
                            <Col className="p-2" lg="auto">
                                <Button
                                    variant="light"
                                    block
                                    onClick={() =>
                                        this.props.onDiscard(this.props.data)
                                    }
                                >
                                    <FontAwesomeIcon
                                        icon={faWindowClose}
                                        className="mr-2"
                                    />
                                    discard
                                </Button>
                            </Col>
                        ) : undefined}
                        {!this.isNew() ? (
                            <React.Fragment>
                                <Col className="p-2" lg="auto">
                                    <Button
                                        variant="success"
                                        block
                                        onClick={() => this.play()}
                                    >
                                        <FontAwesomeIcon
                                            icon={faPlay}
                                            className="mr-2"
                                        />
                                        play
                                    </Button>
                                </Col>
                                <Col className="p-2" lg="auto">
                                    <Button
                                        variant="secondary"
                                        block
                                        onClick={() => this.edit()}
                                    >
                                        <FontAwesomeIcon
                                            icon={faPencilAlt}
                                            className="mr-2"
                                        />
                                        edit
                                    </Button>
                                </Col>{' '}
                                <Col className="p-2" lg="auto">
                                    <a
                                        href={this.props.generateDownloadLink(
                                            this.props.data.contentId
                                        )}
                                    >
                                        <Button variant="info" block>
                                            <FontAwesomeIcon
                                                icon={faFileDownload}
                                                className="mr-2"
                                            />
                                            download
                                        </Button>
                                    </a>
                                </Col>
                                <Col className="p-2" lg="auto">
                                    <Button
                                        variant="danger"
                                        block
                                        onClick={() =>
                                            this.props.onDelete(this.props.data)
                                        }
                                    >
                                        <FontAwesomeIcon
                                            icon={faTrashAlt}
                                            className="mr-2"
                                        />
                                        delete
                                    </Button>
                                </Col>
                            </React.Fragment>
                        ) : undefined}
                    </Row>
                </Container>
                {this.state.editing ? (
                    <div
                        className={
                            this.props.data.contentId !== 'new' &&
                            this.state.loading
                                ? 'loading'
                                : ''
                        }
                    >
                        <H5PEditorUI
                            ref={this.h5pEditor}
                            contentId={this.props.data.contentId}
                            loadContentCallback={
                                this.props.contentService.getEdit
                            }
                            saveContentCallback={this.props.contentService.save}
                            onSaved={this.onSaved}
                            onLoaded={this.onEditorLoaded}
                            onSaveError={this.onSaveError}
                        />
                    </div>
                ) : undefined}
                {this.state.playing ? (
                    <div className={this.state.loading ? 'loading' : ''}>
                        <H5PPlayerUI
                            ref={this.h5pPlayer}
                            contentId={this.props.data.contentId}
                            loadContentCallback={
                                this.props.contentService.getPlay
                            }
                            onInitialized={this.onPlayerInitialized}
                            onxAPIStatement={(
                                statement: any,
                                context: any,
                                event
                            ) => console.log(statement, context, event)}
                        />
                        <div
                            style={{
                                visibility: this.state.loading
                                    ? 'visible'
                                    : 'collapse'
                            }}
                            className="spinner-border spinner-border-sm m-2"
                            role="status"
                        ></div>
                    </div>
                ) : undefined}
            </ListGroupItem>
        );
    }

    protected play() {
        this.setState({ editing: false, playing: true });
    }

    protected edit() {
        this.setState({ editing: true, playing: false });
    }

    protected close() {
        this.setState({ editing: false, playing: false });
    }

    private onPlayerInitialized = () => {
        this.setState({ loading: false });
    };

    protected async save() {
        this.setState({ saving: true });
        try {
            const returnData = await this.h5pEditor.current?.save();
            if (returnData) {
                await this.props.onSaved({
                    contentId: returnData.contentId,
                    mainLibrary: returnData.metadata.mainLibrary,
                    title: returnData.metadata.title,
                    originalNewKey: this.props.data.originalNewKey
                });
            }
        } catch (error) {
            // We ignore the error, as we subscribe to the 'save-error' and
            // 'validation-error' events.
        }
    }

    protected onSaveError = async (event) => {
        this.setState({
            saving: false,
            saved: false,
            saveError: true,
            saveErrorMessage: event.detail.message
        });
        setTimeout(() => {
            this.setState({
                saveError: false
            });
        }, 5000);
    };

    protected onSaved = async (event) => {
        this.setState({
            saving: false,
            saved: true
        });
        setTimeout(() => {
            this.setState({ saved: false });
        }, 3000);
    };

    protected onEditorLoaded = () => {
        this.setState({ loading: false });
    };

    private isNew() {
        return this.props.data.contentId === 'new';
    }
}
